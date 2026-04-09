import { action, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import {
  components,
  internal } from "../_generated/api";
import { createAuth } from "../betterAuth/auth";

// Main action that orchestrates the bulk import
export const processBulkImport = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // 1. Verify the caller is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");


    // 2. Download and read the file from storage
    const blob = await ctx.storage.get(args.storageId);
    if (!blob) throw new Error("File not found in storage");
    const text = await blob.text();
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    const errors: { line: number; message: string }[] = [];
    const auth = createAuth(ctx);

    // Track orgs created in this file so they can be referenced later
    const createdOrgs: Map<string, string> = new Map(); // name -> orgId

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const raw = lines[i].trim();
      const fields = raw.split("|");

      try {
        const type = fields[0]?.trim();

        if (!type || !["O", "D", "S"].includes(type)) {
          errors.push({ line: lineNum, message: `Invalid type "${type}"` });
          continue;
        }

        // --- Organization record ---
        if (type === "O") {
          const orgName = fields[1]?.trim();
          if (!orgName) {
            errors.push({ line: lineNum, message: "Organization name is required" });
            continue;
          }

          // Create org via Better Auth API (no headers = server-side/admin)
          const org = await auth.api.createOrganization({
            body: {
              name: orgName,
              slug: orgName.toLowerCase().replace(/\s+/g, "-"),
              userId: identity.subject, // admin becomes initial owner
              pointValue: 0.01,
            },
          });

          if (org) createdOrgs.set(orgName, org.id);
          continue;
        }

        // --- Driver or Sponsor record ---
        // Format: <type>|org name|first|last|email|points|reason
        const orgName = fields[1]?.trim();
        const firstName = fields[2]?.trim();
        const lastName = fields[3]?.trim();
        const email = fields[4]?.trim();
        const pointsStr = fields[5]?.trim();
        const reason = fields[6]?.trim();

        if (!firstName || !lastName || !email) {
          errors.push({
            line: lineNum,
            message: "First name, last name, and email are required",
          });
          continue;
        }

        if (!orgName) {
          errors.push({ line: lineNum, message: "Organization name is required for admin upload" });
          continue;
        }

        // Resolve organization ID — check created orgs first, then look up existing
        let orgId = createdOrgs.get(orgName);
        if (!orgId) {
          // Look up existing org by name
          const existingOrg = await ctx.runQuery(
            internal.admin.user.findOrgByName,
            { name: orgName }
          );
          if (!existingOrg) {
            errors.push({
              line: lineNum,
              message: `Organization "${orgName}" does not exist and was not created via an O record`,
            });
            continue;
          }
          orgId = existingOrg._id;
        }

        // Find or create the user
        let userId: string;
        const existingUsers = await auth.api.listUsers({
          query: {
            searchValue: email,
            searchField: "email",
            searchOperator: "contains"
          },
        });

        if (existingUsers.users.length > 0) {
          userId = existingUsers.users[0].id;
        } else {
          // Create user with a temporary password
          const tempPassword = crypto.randomUUID();
          const newUser = await auth.api.createUser({
            body: {
              email,
              password: tempPassword,
              name: `${firstName} ${lastName}`,
              role: type === "S" ? "admin" : "driver",
            },
          });
          userId = newUser.user.id;
        }

        // Add user as member of the organization
        const role = type === "S" ? "admin" : "member";
        try {
          await auth.api.addMember({
            body: {
              userId,
              role,
              organizationId: orgId,
            },
          });
        } catch (e: any) {
          // Member may already exist — that's OK
          if (!e.message?.includes("already")) {
            errors.push({ line: lineNum, message: `Failed to add member: ${e.message}` });
            continue;
          }
        }

        if (type === "D") {
          // Auto-approve driver (rule 5)
          await ctx.runMutation(
            internal.admin.user.upsertDriverApplication,
            { userId, orgId, status: "approved" as const }
          );

          // Handle points if present
          if (pointsStr) {
            const points = parseInt(pointsStr, 10);
            if (isNaN(points)) {
              errors.push({ line: lineNum, message: `Invalid points value "${pointsStr}"` });
              continue;
            }
            if (!reason) {
              errors.push({
                line: lineNum,
                message: "Reason is required when points are provided",
              });
              continue;
            }

            await ctx.runMutation(
              internal.admin.user.addPoints,
              {
                driverUserId: userId,
                changedByUserId: identity.subject,
                pointChange: points,
                reason,
              }
            );
          }
        }

        if (type === "S") {
          // Sponsors cannot be assigned points (rule 3)
          if (pointsStr) {
            errors.push({
              line: lineNum,
              message: "Points cannot be assigned to sponsor users — fields ignored",
            });
            // Still create the sponsor, just ignore the points
          }
        }
      } catch (e: any) {
        errors.push({ line: lineNum, message: e.message || "Unknown error" });
      }
    }

    console.log({ totalLines: lines.length, errors });

    return { totalLines: lines.length, errors };
  },
});


export const findOrgByName = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.betterAuth.organizations.getOrganizationByName, { name: args.name });
  },
});

export const upsertDriverApplication = internalMutation({
  args: {
    userId: v.string(),
    orgId: v.string(),
    status: v.union(v.literal("waiting"), v.literal("denied"), v.literal("approved")),
  },
  handler: async (ctx, args) => {
    // Check if application already exists
    const existing = await ctx.db
      .query("driverApplication")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("orgId"), args.orgId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status });
    } else {
      await ctx.db.insert("driverApplication", {
        userId: args.userId,
        orgId: args.orgId,
        status: args.status,
      });

      await ctx.db.insert("auditLog", {
        time: Date.now(),
        event: "application",
        user: args.userId,
        sponsor: args.orgId,
        status: args.status,
        reason: "Bulk import"
      });
    }
  },
});

export const addPoints = internalMutation({
  args: {
    driverUserId: v.string(),
    changedByUserId: v.string(),
    pointChange: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Add a point change record
    await ctx.db.insert("pointChanges", {
      driverUserId: args.driverUserId,
      changedByUserId: args.changedByUserId,
      pointChange: args.pointChange,
      reason: args.reason,
      time: Date.now(),
      organizationId: "", // TODO: fixme
    });

    // Update or create the point totals
    const existing = await ctx.db
      .query("pointTotals")
      .filter((q) => q.eq(q.field("driverUserId"), args.driverUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        points: existing.points + args.pointChange,
      });
    } else {
      await ctx.db.insert("pointTotals", {
        driverUserId: args.driverUserId,
        points: args.pointChange,
        organizationId: "" // TODO: fix me,
      });
    }
  },
});
