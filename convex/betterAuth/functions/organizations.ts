import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import {
    getOrganizationBySlugInternal,
    getOrganizationByNameInternal,
    isUserInOrganizationInternal,
    updateOrganizationInternal,
    getAllOrganizationsInternal,
} from "./internal/organizations";

export const getOrganizationBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.union(
        v.null(),
        v.object({
            _id: v.id("organization"),
            _creationTime: v.number(),
            name: v.string(),
            slug: v.string(),
            logo: v.optional(v.union(v.string(), v.null())),
            createdAt: v.number(),
            metadata: v.optional(v.union(v.string(), v.null())),
            pointValue: v.number(),
            totalMembers: v.optional(v.number()),
        })
    ),
    handler: async (ctx, args) => {
        return getOrganizationBySlugInternal(ctx, args.slug);
    },
});

export const getOrganizationByName = query({
    args: {
        name: v.string(),
    },
    returns: v.union(
        v.null(),
        v.object({
            _id: v.id("organization"),
            _creationTime: v.number(),
            name: v.string(),
            slug: v.string(),
            logo: v.optional(v.union(v.string(), v.null())),
            createdAt: v.number(),
            metadata: v.optional(v.union(v.string(), v.null())),
            pointValue: v.number(),
            totalMembers: v.optional(v.number()),
        })
    ),
    handler: async (ctx, args) => {
        return getOrganizationByNameInternal(ctx, args.name);
    },
});

export const isUserInOrganization = query({
    args: {
        userId: v.string(),
        organizationId: v.string(),
    },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        return isUserInOrganizationInternal(ctx, args.userId, args.organizationId);
    },
});

export const updateOrganization = mutation({
    args: {
        slug: v.string(),
        updates: v.object({
            name: v.optional(v.string()),
            slug: v.optional(v.string()),
            logo: v.optional(v.union(v.string(), v.null())),
            createdAt: v.optional(v.number()),
            metadata: v.optional(v.union(v.string(), v.null())),
            pointValue: v.optional(v.number()),
            totalMembers: v.optional(v.number()),
        }),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        return updateOrganizationInternal(ctx, args.slug, args.updates);
    },
});

export const getAllOrganizations = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("organization"),
            _creationTime: v.number(),
            name: v.string(),
            slug: v.string(),
            logo: v.optional(v.union(v.string(), v.null())),
            createdAt: v.number(),
            metadata: v.optional(v.union(v.string(), v.null())),
            pointValue: v.number(),
            totalMembers: v.optional(v.number()),
        })
    ),
    handler: async (ctx) => {
        return getAllOrganizationsInternal(ctx);
    },
});