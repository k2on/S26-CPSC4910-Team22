import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { components } from "../_generated/api";

// wrapper serves as bridge between app and betterAuth
export const setAuthRole = mutation({
    args: {
        role: v.union(v.literal("driver"), v.literal("sponsor"), v.literal("admin")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("wrapper: not authenticated");

        const userDocId = (identity as { subject?: string }).subject as string | undefined;
        if (!userDocId) throw new Error("wrapper: no identity.subject");

        return await ctx.runMutation(
            components.betterAuth.authUsers.setRoleForUserDocId,
            {
                userDocId,
                role: args.role,
            }
        );
    },
});
