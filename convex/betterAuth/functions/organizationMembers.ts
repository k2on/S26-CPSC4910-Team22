import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import {
    getOrganizationMembersByOrganizationIdInternal,
    getOrganizationMembersBySlugInternal,
    addOrganizationMemberInternal,
    addOrganizationMemberByEmailBySlugInternal,
    removeOrganizationMemberByUserIdAndSlugInternal,
} from "./internal/organizationMembers";

export const getOrganizationMembersByOrganizationId = query({
    args: {
        organizationId: v.string(),
    },
    returns: v.array(
        v.object({
            _id: v.id("member"),
            _creationTime: v.number(),
            organizationId: v.string(),
            userId: v.string(),
            role: v.string(),
            createdAt: v.number(),
        })
    ),
    handler: async (ctx, args) => {
        return getOrganizationMembersByOrganizationIdInternal(ctx, args.organizationId);
    },
});

export const getOrganizationMembersBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.array(
        v.object({
            _id: v.id("member"),
            _creationTime: v.number(),
            organizationId: v.string(),
            userId: v.string(),
            role: v.string(),
            createdAt: v.number(),
        })
    ),
    handler: async (ctx, args) => {
        return getOrganizationMembersBySlugInternal(ctx, args.slug);
    },
});

export const addOrganizationMember = mutation({
    args: {
        organizationId: v.string(),
        userId: v.string(),
        role: v.optional(v.string()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        return addOrganizationMemberInternal(
            ctx,
            args.organizationId,
            args.userId,
            args.role ?? "driver"
        );
    },
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
        return addOrganizationMemberByEmailBySlugInternal(
            ctx,
            args.slug,
            args.email
        );
    },
});

export const removeOrganizationMemberByUserIdAndSlug = mutation({
    args: {
        slug: v.string(),
        userId: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        return removeOrganizationMemberByUserIdAndSlugInternal(
            ctx,
            args.slug,
            args.userId
        );
    },
});