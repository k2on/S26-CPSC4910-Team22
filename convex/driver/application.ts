import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../betterAuth/_generated/dataModel";

export const apply = mutation({
  args: {
    organizationId: v.string()
  },
  handler: async (ctx, args) => {
    const me = await ctx.auth.getUserIdentity();
    if (!me) throw new Error("You are not authed");

    await ctx.db.insert("driverApplication", {
      orgId: args.organizationId,
      status: 'waiting',
      userId: me.subject,
    })
  }
});
