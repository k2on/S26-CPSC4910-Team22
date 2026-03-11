import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

const organizationValidator = v.object({
    _id: v.id("organization"),
    _creationTime: v.number(),
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.union(v.null(), v.string())),
    createdAt: v.number(),
    metadata: v.optional(v.union(v.null(), v.string())),
    pointValue: v.number(),
});

const memberValidator = v.object({
    id: v.string(),
    organizationId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    createdAt: v.number(),
    user: v.object({
        id: v.string(),
        name: v.string(),
        email: v.string(),
        image: v.optional(v.union(v.null(), v.string())),
    }),
});

const driverMemberValidator = v.object({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    active: v.boolean(),
    suspended: v.boolean(),
    suspensionEnd: v.optional(v.union(v.null(), v.number())),
});

async function getOrganizationBySlugInternal(
    ctx: Parameters<typeof query>[0] extends never ? never : any,
    slug: string
) {
    return await ctx.db
        .query("organization")
        .withIndex("slug", (q: any) => q.eq("slug", slug))
        .unique();
}

async function userHasOrganizationAccess(
    ctx: Parameters<typeof query>[0] extends never ? never : any,
    userId: string,
    organizationId: string
) {
    const memberships = await ctx.db
        .query("member")
        .withIndex("userId", (q: any) => q.eq("userId", userId))
        .collect();

    return memberships.some((member: { organizationId: string }) => member.organizationId === organizationId);
}

export const listOrganizations = query({
    args: {},
    returns: v.array(organizationValidator),
    handler: async (ctx) => {
        return await ctx.db
            .query("organization")
            .withIndex("name")
            .collect();
    },
});

export const getOrganizationBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.union(organizationValidator, v.null()),
    handler: async (ctx, args) => {
        return await getOrganizationBySlugInternal(ctx, args.slug);
    },
});

export const listVisibleOrganizations = query({
    args: {
        currentUserId: v.string(),
        canAccessAll: v.boolean(),
    },
    returns: v.array(organizationValidator),
    handler: async (ctx, args) => {
        if (args.canAccessAll) {
            return await ctx.db
                .query("organization")
                .withIndex("name")
                .collect();
        }

        const memberships = await ctx.db
            .query("member")
            .withIndex("userId", (q) => q.eq("userId", args.currentUserId))
            .collect();

        const organizations = await Promise.all(
            memberships.map((member) =>
                ctx.db.get(member.organizationId as Id<"organization">)
            )
        );

        return organizations
            .filter((org): org is NonNullable<typeof org> => org !== null)
            .sort((a, b) => a.name.localeCompare(b.name));
    },
});

export const getVisibleOrganizationBySlug = query({
    args: {
        slug: v.string(),
        currentUserId: v.string(),
        canAccessAll: v.boolean(),
    },
    returns: v.union(organizationValidator, v.null()),
    handler: async (ctx, args) => {
        const organization = await getOrganizationBySlugInternal(ctx, args.slug);

        if (!organization) {
            return null;
        }

        if (args.canAccessAll) {
            return organization;
        }

        const hasAccess = await userHasOrganizationAccess(
            ctx,
            args.currentUserId,
            String(organization._id)
        );

        if (!hasAccess) {
            return null;
        }

        return organization;
    },
});

export const listVisibleOrganizationMembersBySlug = query({
    args: {
        slug: v.string(),
        currentUserId: v.string(),
        canAccessAll: v.boolean(),
    },
    returns: v.array(memberValidator),
    handler: async (ctx, args) => {
        const organization = await getOrganizationBySlugInternal(ctx, args.slug);

        if (!organization) {
            return [];
        }

        if (!args.canAccessAll) {
            const hasAccess = await userHasOrganizationAccess(
                ctx,
                args.currentUserId,
                String(organization._id)
            );

            if (!hasAccess) {
                return [];
            }
        }

        const organizationId = String(organization._id);

        const members = await ctx.db
            .query("member")
            .withIndex("organizationId", (q) => q.eq("organizationId", organizationId))
            .collect();

        const membersWithUsers = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId as Id<"user">);

                if (!user) {
                    return null;
                }

                return {
                    id: String(member._id),
                    organizationId: member.organizationId,
                    userId: member.userId,
                    role: member.role as "owner" | "admin" | "member",
                    createdAt: member.createdAt,
                    user: {
                        id: String(user._id),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    },
                };
            })
        );

        return membersWithUsers.filter(
            (member): member is NonNullable<typeof member> => member !== null
        );
    },
});

export const listVisibleOrganizationDriversBySlug = query({
    args: {
        slug: v.string(),
        currentUserId: v.string(),
        canAccessAll: v.boolean(),
    },
    returns: v.array(driverMemberValidator),
    handler: async (ctx, args) => {
        const organization = await getOrganizationBySlugInternal(ctx, args.slug);

        if (!organization) {
            return [];
        }

        if (!args.canAccessAll) {
            const hasAccess = await userHasOrganizationAccess(
                ctx,
                args.currentUserId,
                String(organization._id)
            );

            if (!hasAccess) {
                return [];
            }
        }

        const organizationId = String(organization._id);

        const members = await ctx.db
            .query("member")
            .withIndex("organizationId", (q) => q.eq("organizationId", organizationId))
            .collect();

        const drivers = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId as Id<"user">);

                if (!user || user.role !== "driver") {
                    return null;
                }

                const suspended =
                    Boolean(user.banned) &&
                    typeof user.banExpires === "number" &&
                    user.banExpires > Date.now();

                return {
                    userId: String(user._id),
                    name: user.name,
                    email: user.email,
                    active: !Boolean(user.banned),
                    suspended,
                    suspensionEnd: user.banExpires ?? null,
                };
            })
        );

        return drivers.filter(
            (driver): driver is NonNullable<typeof driver> => driver !== null
        );
    },
});

export const addMemberByEmail = mutation({
    args: {
        slug: v.string(),
        email: v.string(),
        currentUserId: v.string(),
        canAccessAll: v.boolean(),
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
        const organization = await getOrganizationBySlugInternal(ctx, args.slug);

        if (!organization) {
            throw new Error("Organization not found");
        }

        if (!args.canAccessAll) {
            const hasAccess = await userHasOrganizationAccess(
                ctx,
                args.currentUserId,
                String(organization._id)
            );

            if (!hasAccess) {
                throw new Error("unauthorized");
            }
        }

        const user = await ctx.db
            .query("user")
            .withIndex("email_name", (q) => q.eq("email", args.email))
            .unique();

        if (!user) {
            return {
                status: "user_not_found" as const,
                organizationName: organization.name,
            };
        }

        const organizationId = String(organization._id);

        const existingMembers = await ctx.db
            .query("member")
            .withIndex("organizationId", (q) => q.eq("organizationId", organizationId))
            .collect();

        const alreadyExists = existingMembers.some(
            (member) => member.userId === String(user._id)
        );

        if (alreadyExists) {
            return {
                status: "already_exists" as const,
                organizationName: organization.name,
            };
        }

        await ctx.db.insert("member", {
            organizationId,
            userId: String(user._id),
            role: "member",
            createdAt: Date.now(),
        });

        return {
            status: "added" as const,
            organizationName: organization.name,
        };
    },
});

export const updateVisibleOrganization = mutation({
    args: {
        organizationId: v.string(),
        data: v.object({
            name: v.optional(v.string()),
            slug: v.optional(v.string()),
            pointValue: v.optional(v.number()),
        }),
        currentUserId: v.string(),
        canAccessAll: v.boolean(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        if (!args.canAccessAll) {
            const hasAccess = await userHasOrganizationAccess(
                ctx,
                args.currentUserId,
                args.organizationId
            );

            if (!hasAccess) {
                throw new Error("unauthorized");
            }
        }

        await ctx.db.patch(args.organizationId as Id<"organization">, args.data);
        return null;
    },
});