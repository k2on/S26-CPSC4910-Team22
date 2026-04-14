import {v} from "convex/values";
import {mutation, query} from "./_generated/server";
import {
    getOrganizationDriverStatusBySlug as getOrganizationDriverStatusBySlugLogistics
} from "./functions/logistics/organizationMembers";
import {
    getOrganizationMembersTableBySlug as getOrganizationMembersTableBySlugLogistics
} from "./functions/logistics/organizationMembers";
import {
    getOrganizationPointChangesBySlug as getOrganizationPointChangesBySlugLogistics,
    getPointTransferRequestsBySlug as getPointTransferRequestsBySlugLogistics,
    createPointTransferRequest as createPointTransferRequestLogistics,
    updatePointTransferRequest as updatePointTransferRequestLogistics,
} from "./functions/logistics/points";
import {components} from "./_generated/api";

// only outputs own point changes when called by driver
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

export const getOrganizationIdBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.union(v.null(), v.string()),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        return await ctx.runQuery(
            components.betterAuth.functions.organizations.getOrganizationIdBySlug,
            {
                slug: args.slug,
            }
        );
    },
});

export const getOrganizationNameBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.union(v.null(), v.string()),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        return await ctx.runQuery(
            components.betterAuth.functions.organizations.getOrganizationNameBySlug,
            {
                slug: args.slug,
            }
        );
    },
});

export const getOrganizationMembersTableBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.array(
        v.object({
            id: v.string(),
            organizationId: v.string(),
            role: v.union(
                v.literal("admin"),
                v.literal("member"),
                v.literal("owner")
            ),
            createdAt: v.number(),
            userId: v.string(),
            user: v.object({
                id: v.string(),
                email: v.string(),
                name: v.string(),
                image: v.optional(v.string()),
            }),
        })
    ),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return [];
        }

        return getOrganizationMembersTableBySlugLogistics(ctx, args.slug);
    },
});

export const getPointTransferRequestsBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.object({
        incomingRequests: v.array(
            v.object({
                id: v.string(),
                requestingUserName: v.string(),
                pointsRequested: v.number(),
                reason: v.string(),
                status: v.string(),
            })
        ),
        outgoingRequests: v.array(
            v.object({
                id: v.string(),
                requestedUserName: v.string(),
                pointsRequested: v.number(),
                reason: v.string(),
                status: v.string(),
            })
        ),
    }),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return {
                incomingRequests: [],
                outgoingRequests: [],
            };
        }

        return getPointTransferRequestsBySlugLogistics(ctx, args.slug, identity);
    },
});

export const createPointTransferRequest = mutation({
    args: {
        slug: v.string(),
        points: v.number(),
        email: v.string(),
        reason: v.string(),
    },
    returns: v.object({
        result: v.union(v.literal("success"), v.literal("failed")),
        message: v.string(),
    }),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return {
                result: "failed",
                message: "Unauthorized",
            } as const;
        }

        return createPointTransferRequestLogistics(
            ctx,
            args.slug,
            args.points,
            args.email,
            args.reason,
            identity
        );
    },
});

export const UpdatePointTransferRequest = mutation({
    args: {
        transferRequestId: v.string(),
        updateType: v.union(
            v.literal("approve"),
            v.literal("deny"),
            v.literal("cancel")
        ),
    },
    returns: v.object({
        result: v.string(),
    }),
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return {
                result: "unauthorized",
            };
        }

        return updatePointTransferRequestLogistics(
            ctx,
            args.transferRequestId,
            args.updateType
        );
    },
});