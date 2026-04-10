import type { QueryCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import { getPointChangesByOrganizationId } from "../data/points";
import type { UserIdentity } from "convex/server";
import { filterPointChangesByIdentity } from "./filters"

export async function getOrganizationPointChangesBySlug(
    ctx: QueryCtx,
    slug: string,
    identity: UserIdentity
) {
    const organization = await ctx.runQuery(
        components.betterAuth.functions.organizations.getOrganizationBySlug,
        { slug }
    );

    if (!organization) {
        return [];
    }

    const organizationId = String(organization._id);

    const organizationMembers = await ctx.runQuery(
        components.betterAuth.functions.organizationMembers.getOrganizationMembersByOrganizationId,
        { organizationId }
    );

    const organizationMemberUserIds = Array.from(
        new Set(organizationMembers.map((member) => String(member.userId)))
    );

    const memberUsers =
        organizationMemberUserIds.length === 0
            ? []
            : await ctx.runQuery(
                components.betterAuth.functions.user.getUsersByIds,
                { userIds: organizationMemberUserIds }
            );

    const driverUserIds = new Set(
        memberUsers
            .filter((user) => user.role === "driver")
            .map((user) => String(user._id))
    );

    const pointChanges = await getPointChangesByOrganizationId(ctx, organizationId);

    const relevantPointChanges = pointChanges.filter((change) =>
        driverUserIds.has(String(change.driverUserId))
    );

    const filteredPointChanges = await filterPointChangesByIdentity(
        relevantPointChanges,
        identity
    );

    const allRelevantUserIds = Array.from(
        new Set([
            ...filteredPointChanges.map((change) => String(change.driverUserId)),
            ...filteredPointChanges.map((change) => String(change.changedByUserId)),
        ])
    );

    const users =
        allRelevantUserIds.length === 0
            ? []
            : await ctx.runQuery(
                components.betterAuth.functions.user.getUsersByIds,
                { userIds: allRelevantUserIds }
            );

    const userMap = new Map(
        users.map((user) => [
            String(user._id),
            {
                name: user.name,
                email: user.email,
            },
        ])
    );

    return filteredPointChanges
        .map((change) => ({
            id: String(change._id),
            driverName: userMap.get(String(change.driverUserId))?.name ?? "Unknown User",
            driverEmail:
                userMap.get(String(change.driverUserId))?.email ?? "Unknown Email",
            changedByName:
                userMap.get(String(change.changedByUserId))?.name ?? "Unknown User",
            pointChange: change.pointChange,
            reason: change.reason,
            time: change.time,
        }))
        .sort((a, b) => b.time - a.time);
}