import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addToCart = mutation({
    args: {
        organizationId: v.string(),
        trackId: v.number(),
        mediaType: v.string(),
        name: v.string(),
        artistName: v.string(),
        price: v.number(),
        artworkUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new Error("User identity not found. Cannot add item to cart.");
        }
        const userId = identity.subject;

        const existing = await ctx.db
            .query("cartItem")
            .withIndex("by_user_org_track", (q) =>
                q.eq("userId", userId).eq("organizationId", args.organizationId).eq("trackId", args.trackId)
            )
            .first();
        if (existing) {
            return { success: true, message: "Item already in cart" };
        }
        
        await ctx.db.insert("cartItem", {
            ...args,
            userId: identity.subject,
            createdAt: Date.now(),
        });

        return { success: true };
    }
})

export const removeFromCart = mutation({
    args: { 
        organizationId: v.string(),
        trackId: v.number()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("User identity not found");

        const existing = await ctx.db
            .query("cartItem")
            .withIndex("by_user_org_track", (q) =>
                q.eq("userId", identity.subject).eq("organizationId", args.organizationId).eq("trackId", args.trackId)
            )
            .first();

        if(existing){
            await ctx.db.delete(existing._id);
        }
    },
})

export const getMyCart = query({
    args: { organizationId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("cartItem")
            .withIndex("by_user_org", (q) => q.eq("userId", identity.subject).eq("organizationId", args.organizationId))
            .collect();
    },
})