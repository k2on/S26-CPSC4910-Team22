import type { QueryCtx, MutationCtx } from "../../_generated/server";
import {
    getOrganizationBySlugInternal,
    isUserInOrganizationInternal,
    adjustOrganizationMemberCountInternal,
} from "./organizations";
import { getUserByEmailInternal } from "./user";

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

export async function addOrganizationMemberByEmailBySlugInternal(
    ctx: MutationCtx,
    slug: string,
    email: string
) {
    const organization = await getOrganizationBySlugInternal(ctx, slug);

    if (!organization) {
        throw new Error("Organization not found");
    }

    const user = await getUserByEmailInternal(ctx, email);

    if (!user) {
        return {
            status: "user_not_found" as const,
            organizationName: organization.name,
        };
    }

    const organizationId = String(organization._id);
    const userId = String(user._id);

    const alreadyExists = await isUserInOrganizationInternal(
        ctx,
        userId,
        organizationId
    );

    if (alreadyExists) {
        return {
            status: "already_exists" as const,
            organizationName: organization.name,
        };
    }

    await addOrganizationMemberInternal(ctx, organizationId, userId, "member");
    await adjustOrganizationMemberCountInternal(ctx, slug, 1);

    return {
        status: "added" as const,
        organizationName: organization.name,
    };
}

export async function removeOrganizationMemberByUserIdAndSlugInternal(
    ctx: MutationCtx,
    slug: string,
    userId: string
) {
    const organization = await getOrganizationBySlugInternal(ctx, slug);

    if (!organization) {
        throw new Error("Organization not found");
    }

    const organizationId = String(organization._id);

    const members = await getOrganizationMembersByOrganizationIdInternal(
        ctx,
        organizationId
    );

    const existingMember = members.find(
        (member) => String(member.userId) === userId
    );

    if (!existingMember) {
        throw new Error("Member not found");
    }

    await ctx.db.delete(existingMember._id);
    await adjustOrganizationMemberCountInternal(ctx, slug, -1);

    return null;
}