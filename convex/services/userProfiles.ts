import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const createUserProfile = mutation({
    args: {
        address: v.optional(v.string()),
        profilePictureBorderColor: v.optional(v.string()),
        profilePictureId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("not authenticated");
        }

        const existing = await ctx.db
            .query("userProfiles")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (existing) return;

        await ctx.db.insert("userProfiles", {
            address: args.address,
            profilePictureBorderColor: args.profilePictureBorderColor,
            profilePictureId: args.profilePictureId,
            tokenIdentifier: identity.tokenIdentifier,
        });
    },
});


export const getUserProfileInfo = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("could not identify user");
        }

        const profile = await ctx.db
            .query("userProfiles")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!profile) {
            throw new Error("user profile not found");
        }

        let profilePictureUrl: string | undefined = undefined;
        if (profile.profilePictureId) {
            const url = await ctx.storage.getUrl(profile.profilePictureId);
            profilePictureUrl = url ?? undefined;
        }

        return {
            profilePictureId: profile.profilePictureId,
            profilePictureBorderColor: profile.profilePictureBorderColor,
            address: profile.address,
            profilePictureUrl,
        };
    },
});


export const updateUserProfile = mutation({
    args: {
        profilePictureId: v.optional(v.string()),
        profilePictureBorderColor: v.optional(v.string()),
        address: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("not authenticated");
        }

        const existing = await ctx.db
            .query("userProfiles")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (!existing) {
            throw new Error("user profile not found");
        }

        const patch: Record<string, unknown> = {};
        if (args.profilePictureId !== undefined) {
            patch.profilePictureId = args.profilePictureId;
        }
        if (args.profilePictureBorderColor !== undefined) {
            patch.profilePictureBorderColor = args.profilePictureBorderColor;
        }
        if (args.address !== undefined) {
            patch.address = args.address;
        }

        if (Object.keys(patch).length === 0) return;

        await ctx.db.patch(existing._id, patch);
    },
});


