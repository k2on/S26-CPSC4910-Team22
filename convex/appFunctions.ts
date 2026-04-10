import { v } from "convex/values";
import {mutation, query} from "./_generated/server";
import {
    getOrganizationPointChangesBySlug as getOrganizationPointChangesBySlugLogistics
} from "./functions/logistics/points";
import {
    getOrganizationDriverStatusBySlug as getOrganizationDriverStatusBySlugLogistics
} from "./functions/logistics/organizationMembers";
import {components} from "./_generated/api";

export const getOrganizationPointChangesBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.array(
        v.object({
            id: v.string(),
            driverName: v.string(),
            driverEmail: v.string(),
            changedByName: v.string(),
            pointChange: v.number(),
            reason: v.string(),
            time: v.number(),
        })
    ),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return [];
        }

        return getOrganizationPointChangesBySlugLogistics(ctx, args.slug, identity);
    },
});

export const getOrganizationDriverStatusBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.array(
        v.object({
            userId: v.string(),
            name: v.string(),
            email: v.string(),
            points: v.number(),
            active: v.boolean(),
            suspended: v.boolean(),
            suspensionEnd: v.union(v.number(), v.null()),
            banReason: v.union(v.string(), v.null()),
        })
    ),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
            return [];
        }

        return getOrganizationDriverStatusBySlugLogistics(ctx, args.slug);
    }
});

export const addOrganizationMemberByEmailBySlug = mutation({
    args: {
        slug: v.string(),
        email: v.string(),
    },
    returns: v.object({
        status: v.union(
            v.literal("added"),
            v.literal("already_exists"),
            v.literal("user_not_found")
        ),
        organizationName: v.string(),
    }),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
            throw new Error("unauthorized");
        }

        return await ctx.runMutation(
            components.betterAuth.functions.organizationMembers.addOrganizationMemberByEmailBySlug,
            {
                slug: args.slug,
                email: args.email,
            }
        );
    }
});

export const removeOrganizationMemberByUserIdAndSlug = mutation({
    args: {
        slug: v.string(),
        userId: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity || (identity.role !== "admin" && identity.role !== "sponsor")) {
            throw new Error("unauthorized");
        }

        return await ctx.runMutation(
            components.betterAuth.functions.organizationMembers.removeOrganizationMemberByUserIdAndSlug,
            {
                slug: args.slug,
                userId: args.userId,
            }
        );
    }
});