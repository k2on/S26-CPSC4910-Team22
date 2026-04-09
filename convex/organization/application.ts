import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { Doc as AuthDoc, Id } from "../betterAuth/_generated/dataModel";
import { components } from "../_generated/api";
import { authComponent, createAuth } from "../betterAuth/auth";

export const list = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const result: { application: Doc<"driverApplication">, driver: AuthDoc<"user"> }[] = [];

    const allApplications = await ctx.db.query("driverApplication")
      .withIndex("by_org_id", q => q.eq("orgId", args.orgId))
      .collect();
    const applications = allApplications.filter(application => application.status == "waiting");

    const users = await ctx.runQuery(components.betterAuth.user.getUsersFromIds, { ids: applications.map(application => application.userId) })

    for (const application of applications) {
      const driver = users?.find(user => user._id == application.userId);
      if (!driver) continue;
      result.push({
        application,
        driver: {
          ...driver,
          _id: driver._id as Id<"user">
        },
      });
    }

    return result;
  }
});

export const approve = mutation({
  args: {
    id: v.id("driverApplication")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw Error("Not logged in");

    const application = await ctx.db.get(args.id);
    if (!application) throw Error("Application not found");
    if (application.status != "waiting") throw Error("Application can only be approved when its waiting");
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    await auth.api.addMember({
      body: {
        userId: application.userId,
        organizationId: application.orgId,
        role: "member",
      },
      headers,
    });

    await ctx.db.patch(application._id, {
      status: "approved",
      decisionBy: identity.subject,
    });

  }
});

export const deny = mutation({
  args: {
    id: v.id("driverApplication"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw Error("Not logged in");

    const application = await ctx.db.get(args.id);
    if (!application) throw Error("Application not found");
    if (application.status != "waiting") throw Error("Application can only be approved when its waiting");

    await ctx.db.patch(application._id, {
      status: "denied",
      decisionBy: identity.subject,
      denyComment: args.comment,
    });
  }
});
