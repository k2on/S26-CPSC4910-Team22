import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { components } from "../_generated/api";



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
    const identity = await ctx.auth.getUserIdentity();
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
        reason: "Bulk import",
        enactor: identity?.subject || null,
        enactorEmail: identity?.email || null,
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
