import type { QueryCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import { getPointTotalsByOrganizationId } from "../data/points";

export async function getOrganizationDriverStatusBySlug(
    ctx: QueryCtx,
    slug: string
) {
    const organization = await ctx.runQuery(
        components.betterAuth.functions.organizations.getOrganizationBySlug,
        { slug }
    );

    if (!organization) {
        return [];
    }

    const organizationId = String(organization._id);

    const drivers = await ctx.runQuery(
        components.betterAuth.functions.user.getOrganizationDriversBySlug,
        { slug }
    );

    const pointTotals = await getPointTotalsByOrganizationId(ctx, organizationId);

    const pointTotalsMap = new Map(
        pointTotals.map((pointTotal) => [
            String(pointTotal.driverUserId),
            pointTotal.points,
        ])
    );

    return drivers.map((driver) => ({
        userId: String(driver._id),
        name: driver.name,
        email: driver.email,
        points: pointTotalsMap.get(String(driver._id)) ?? 0,
        active: driver.banned !== true,
        suspended: driver.banExpires != null,
        suspensionEnd: driver.banExpires ?? null,
        banReason: driver.banReason ?? null,
    }));
}

export async function getOrganizationMembersTableBySlug(
    ctx: QueryCtx,
    slug: string
) {
    const organization = await ctx.runQuery(
        components.betterAuth.functions.organizations.getOrganizationBySlug,
        { slug }
    );

    if (!organization) {
        return [];
    }

    const organizationId = String(organization._id);

    const members = await ctx.runQuery(
        components.betterAuth.functions.organizationMembers.getOrganizationMembersByOrganizationId,
        { organizationId }
    );

    const userIds = Array.from(
        new Set(members.map((member) => String(member.userId)))
    );

    const users =
        userIds.length === 0
            ? []
            : await ctx.runQuery(
                components.betterAuth.functions.user.getUsersByIds,
                { userIds }
            );

    const userMap = new Map(
        users.map((user) => [
            String(user._id),
            {
                id: String(user._id),
                email: user.email,
                name: user.name,
                image: user.image ?? undefined,
            },
        ])
    );

    return members
        .map((member) => ({
            id: String(member._id),
            organizationId: member.organizationId,
            role: member.role as "admin" | "member" | "owner",
            createdAt: member._creationTime,
            userId: member.userId,
            user:
                userMap.get(String(member.userId)) ?? {
                    id: String(member.userId),
                    email: "Unknown Email",
                    name: "Unknown User",
                    image: undefined,
                },
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
}