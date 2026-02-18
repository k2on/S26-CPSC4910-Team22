import { mutation } from "./_generated/server";
import { v } from "convex/values";


export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});


export const createUserProfile = mutation({
    args: {
        role: v.optional(v.union(v.literal("driver"), v.literal("sponsor"), v.literal("admin"))),
        address: v.optional(v.string()),
        profilePictureBorderColor: v.optional(v.string()),
        profilePictureId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("failed to create user");
        }

        const existing = await ctx.db
            .query("userProfiles")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (existing) return;

        await ctx.db.insert("userProfiles", {
            role: args.role,
            address: args.address,
            profilePictureBorderColor: args.profilePictureBorderColor,
            profilePictureId: args.profilePictureId,
            tokenIdentifier: identity.tokenIdentifier,
        });
    },
});




