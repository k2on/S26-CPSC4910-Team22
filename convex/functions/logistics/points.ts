import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import {
    getPointChangesByOrganizationId,
    getPointTransferRequestsByRequestedUserId,
    getPointTransferRequestsByRequestingUserId,
    createPointTransferRequest as createPointTransferRequestData,
} from "../data/points";
import type { UserIdentity } from "convex/server";
import { filterPointChangesByIdentity } from "./filters";

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

export async function getPointTransferRequestsBySlug(
    ctx: QueryCtx,
    slug: string,
    identity: UserIdentity
) {
    const organizationId = await ctx.runQuery(
        components.betterAuth.functions.organizations.getOrganizationIdBySlug,
        { slug }
    );

    if (!organizationId) {
        return {
            incomingRequests: [],
            outgoingRequests: [],
        };
    }

    const currentUserId = identity.subject;

    const incomingRows = (
        await getPointTransferRequestsByRequestedUserId(ctx, currentUserId)
    ).filter((row) => row.organizationId === organizationId);

    const outgoingRows = (
        await getPointTransferRequestsByRequestingUserId(ctx, currentUserId)
    ).filter((row) => row.organizationId === organizationId);

    const allRelevantUserIds = Array.from(
        new Set([
            ...incomingRows.map((row) => String(row.requestingUserId)),
            ...outgoingRows.map((row) => String(row.requestedUserId)),
        ])
    );

    const users =
        allRelevantUserIds.length === 0
            ? []
            : await ctx.runQuery(
                components.betterAuth.functions.user.getUsersByIds,
                { userIds: allRelevantUserIds }
            );

    const userMap = new Map(users.map((user) => [String(user._id), user.name]));

    return {
        incomingRequests: incomingRows.map((row) => ({
            requestingUserName:
                userMap.get(String(row.requestingUserId)) ?? "Unknown User",
            pointsRequested: row.pointsRequested,
            reason: row.reason,
            status: row.status,
        })),
        outgoingRequests: outgoingRows.map((row) => ({
            requestedUserName:
                userMap.get(String(row.requestedUserId)) ?? "Unknown User",
            pointsRequested: row.pointsRequested,
            reason: row.reason,
            status: row.status,
        })),
    };
}

export async function createPointTransferRequest(
    ctx: MutationCtx,
    slug: string,
    points: number,
    email: string,
    reason: string,
    identity: UserIdentity
) {
    const organization = await ctx.runQuery(
        components.betterAuth.functions.organizations.getOrganizationBySlug,
        { slug }
    );

    if (!organization) {
        throw new Error("Organization not found");
    }

    if (!Number.isInteger(points) || points <= 0) {
        return {
            result: "failed" as const,
            message: "You can only request a positive whole number of points",
        };
    }

    const requestedUser = await ctx.runQuery(
        components.betterAuth.functions.user.getUserByEmail,
        { email }
    );

    if (!requestedUser) {
        return {
            result: "failed" as const,
            message: `${email} does not belong to any users in ${organization.name}`,
        };
    }

    const organizationId = String(organization._id);
    const requestedUserId = String(requestedUser._id);

    const isRequestedUserInOrganization = await ctx.runQuery(
        components.betterAuth.functions.organizations.isUserInOrganization,
        {
            userId: requestedUserId,
            organizationId,
        }
    );

    if (!isRequestedUserInOrganization) {
        return {
            result: "failed" as const,
            message: `${email} does not belong to any users in ${organization.name}`,
        };
    }

    await createPointTransferRequestData(
        ctx,
        identity.subject,
        requestedUserId,
        organizationId,
        points,
        reason,
        "pending"
    );

    return {
        result: "success" as const,
        message: "Transfer request sent successfully",
    };
}