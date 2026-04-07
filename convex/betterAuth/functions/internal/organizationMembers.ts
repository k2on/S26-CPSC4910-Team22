import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { getOrganizationBySlugInternal } from "./organizations";

export async function getOrganizationMembersByOrganizationIdInternal(
    ctx: QueryCtx | MutationCtx,
    organizationId: string
) {
    return ctx.db
        .query("member")
        .withIndex("organizationId", (q) => q.eq("organizationId", organizationId))
        .collect();
}

export async function getOrganizationMembersBySlugInternal(
    ctx: QueryCtx | MutationCtx,
    slug: string
) {
    const organization = await getOrganizationBySlugInternal(ctx, slug);

    if (!organization) {
        throw new Error("Organization not found");
    }

    return getOrganizationMembersByOrganizationIdInternal(
        ctx,
        String(organization._id)
    );
}

export async function addOrganizationMemberInternal(
    ctx: MutationCtx,
    organizationId: string,
    userId: string,
    role: string = "member"
) {
    await ctx.db.insert("member", {
        organizationId,
        userId,
        role,
        createdAt: Date.now(),
    });

    return null;
}