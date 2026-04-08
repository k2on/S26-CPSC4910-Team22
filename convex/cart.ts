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

export const purchaseCartItems = mutation({
    args: {
        organizationId: v.string(),
        items: v.array(v.object({
            trackId: v.number(),
            price: v.number(),
        }))},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error("Unauthorized");
        const userId = identity.subject;
        const totalCost = args.items.reduce((sum, item) => sum + item.price, 0);
        const existingTotal = await ctx.db
            .query("pointTotals")
            .filter((q) =>
                q.and(
                    q.eq(q.field("driverUserId"), userId),
                    q.eq(q.field("organizationId"), args.organizationId)
                )
            )
            .first();

        const currentPoints = existingTotal?.points ?? 0;
        if(currentPoints < totalCost){
            throw new Error("Insufficient points for purchase");
        }

        await ctx.db.patch(existingTotal!._id, {
            points: currentPoints - totalCost,
        });
        await ctx.db.insert("pointChanges", {
            driverUserId: userId,
            organizationId: args.organizationId,
            changedByUserId: userId,
            pointChange: -totalCost,
            reason: "Catalog Purchase",
            time: Date.now(),
        });

        for(const item of args.items){
            const alreadyOwned = await ctx.db
                .query("ownedItems")
                .withIndex("by_user_track", (q) =>
                    q.eq("userId", userId).eq("trackId", item.trackId)
                )
                .first();

            if(!alreadyOwned){
                await ctx.db.insert("ownedItems", {
                    userId,
                    trackId: item.trackId,
                    purchasedAt: Date.now(),
                });
            }
        }

        const cartItems = await ctx.db
            .query("cartItem")
            .withIndex("by_user_org", (q) =>
                q.eq("userId", userId).eq("organizationId", args.organizationId)
            )
            .collect();
        
        for(const cartItem of cartItems){
            await ctx.db.delete(cartItem._id);
        }

        return { success: true };
    },
});

export const isOwned = query({
    args: { trackId: v.number() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            return false;
        }
        const existing = await ctx.db
            .query("ownedItems")
            .withIndex("by_user_track", (q) =>
                q.eq("userId", identity.subject).eq("trackId", args.trackId)
            )
            .first();
        return !!existing;

    }
});

export const purchaseSingleItem = mutation({
    args: {
        organizationId: v.string(),
        trackId: v.number(),
        price: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new Error("Unauthorized");
        }
        const userId = identity.subject;

        const existingTotal = await ctx.db
            .query("pointTotals")
            .filter((q) => 
                q.and(
                    q.eq(q.field("driverUserId"), userId),
                    q.eq(q.field("organizationId"), args.organizationId)
                )
            )
            .first();
        
        const currentPoints = existingTotal?.points ?? 0;
        if(currentPoints < args.price){
            throw new Error("Insufficient points for purchase");
        }

        await ctx.db.patch(existingTotal!._id, {
            points: currentPoints - args.price,
        });

        await ctx.db.insert("pointChanges", {
            driverUserId: userId,
            organizationId: args.organizationId,
            changedByUserId: userId,
            pointChange: -args.price,
            reason: "Catalog Purchase",
            time: Date.now(),
        });

        const alreadyOwned = await ctx.db
            .query("ownedItems")
            .withIndex("by_user_track", (q) =>
                q.eq("userId", userId).eq("trackId", args.trackId)
            )
            .first();

        if(!alreadyOwned){
            await ctx.db.insert("ownedItems", {
                userId,
                trackId: args.trackId,
                purchasedAt: Date.now(),
            });
        }

        return { success: true };
    },
});