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
        return await ctx.db
            .query("organization")
            .withIndex("slug", (q) => q.eq("slug", args.slug))
            .unique();
    },
});

export const listOrganizationMembersBySlug = query({
    args: {
        slug: v.string(),
    },
    returns: v.array(memberValidator),
    handler: async (ctx, args) => {
        const organization = await ctx.db
            .query("organization")
            .withIndex("slug", (q) => q.eq("slug", args.slug))
            .unique();

        if (!organization) {
            return [];
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

export const addMemberByEmail = mutation({
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
        const organization = await ctx.db
            .query("organization")
            .withIndex("slug", (q) => q.eq("slug", args.slug))
            .unique();

        if (!organization) {
            throw new Error("Organization not found");
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

export const updateOrganization = mutation({
    args: {
        organizationId: v.id("organization"),
        data: v.object({
            name: v.optional(v.string()),
            slug: v.optional(v.string()),
            pointValue: v.optional(v.number()),
        }),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.organizationId, args.data);
        return null;
    },
});