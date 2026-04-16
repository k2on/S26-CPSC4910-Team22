import type { QueryCtx, MutationCtx } from "../../_generated/server";

export async function getOrganizationBySlugInternal(
    ctx: QueryCtx | MutationCtx,
    slug: string
) {
    return ctx.db
        .query("organization")
        .withIndex("slug", (q) => q.eq("slug", slug))
        .unique();
}

export async function getOrganizationIdBySlugInternal(
    ctx: QueryCtx | MutationCtx,
    slug: string
) {
    const organization = await getOrganizationBySlugInternal(ctx, slug);

    if (!organization) {
        return null;
    }

    return String(organization._id);
}

export async function getOrganizationNameBySlugInternal(
    ctx: QueryCtx | MutationCtx,
    slug: string
) {
    const organization = await getOrganizationBySlugInternal(ctx, slug);

    if (!organization) {
        return null;
    }

    return organization.name;
}

export async function getOrganizationByNameInternal(
    ctx: QueryCtx | MutationCtx,
    name: string
) {
    return ctx.db
        .query("organization")
        .withIndex("name", (q) => q.eq("name", name))
        .unique();
}

export async function isUserInOrganizationInternal(
    ctx: QueryCtx | MutationCtx,
    userId: string,
    organizationId: string
) {
    const memberships = await ctx.db
        .query("member")
        .withIndex("organizationId", (q) => q.eq("organizationId", organizationId))
        .collect();

    return memberships.some((member) => member.userId === userId);
}

export async function updateOrganizationInternal(
    ctx: MutationCtx,
    slug: string,
    updates: {
        name?: string;
        slug?: string;
        logo?: string | null;
        createdAt?: number;
        metadata?: string | null;
        pointValue?: number;
        totalMembers?: number;
    }
) {
    const organization = await getOrganizationBySlugInternal(ctx, slug);

    if (!organization) {
        throw new Error("Organization not found");
    }

    await ctx.db.patch(organization._id, updates);

    return null;
}

export async function adjustOrganizationMemberCountInternal(
    ctx: MutationCtx,
    slug: string,
    amount: number
) {
    const organization = await getOrganizationBySlugInternal(ctx, slug);

    if (!organization) {
        throw new Error("Organization not found");
    }

    const currentTotalMembers = organization.totalMembers ?? 0;

    await ctx.db.patch(organization._id, {
        totalMembers: currentTotalMembers + amount,
    });

    return null;
}

export async function getAllOrganizationsInternal(
    ctx: QueryCtx | MutationCtx
) {
    return ctx.db.query("organization").collect();
}

