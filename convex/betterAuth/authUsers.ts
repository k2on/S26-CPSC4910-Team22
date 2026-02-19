import { mutation } from "./_generated/server";
import { v } from "convex/values";

//
export const setRoleForUserDocId = mutation({
    args: {
        userDocId: v.id("user"),
        role: v.union(v.literal("driver"), v.literal("sponsor"), v.literal("admin")),
    },
    handler: async (ctx, args) => {
        const userDoc = await ctx.db.get(args.userDocId);
        if (!userDoc) {
            throw new Error("Better Auth user not found for provided userDocId");
        }

        await ctx.db.patch(userDoc._id, { role: args.role });
        return { ok: true, role: args.role };
    },
});
