import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import {
    getPointChangesByOrganizationId,
    getPointTransferRequestsByRequestedUserId,
    getPointTransferRequestsByRequestingUserId,
    createPointTransferRequest as createPointTransferRequestData,
    getPointTotalByDriverAndOrganizationId,
    ensurePointTotalExists,
    setPointTotal,
    createPointChange,
    getPointTransferRequestById,
    updatePointTransferRequestStatus,
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
            id: String(row._id),
            requestingUserName:
                userMap.get(String(row.requestingUserId)) ?? "Unknown User",
            pointsRequested: row.pointsRequested,
            reason: row.reason,
            status: row.status,
        })),
        outgoingRequests: outgoingRows.map((row) => ({
            id: String(row._id),
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

export async function updatePoints(
    ctx: MutationCtx,
    driverUserId: string,
    organizationId: string,
    changedByUserId: string,
    pointChange: number,
    reason: string
) {
    const existingPointTotal = await ensurePointTotalExists(
        ctx,
        driverUserId,
        organizationId
    );

    if (!existingPointTotal) {
        throw new Error("Unable to initialize point total");
    }

    const updatedPointTotal = existingPointTotal.points + pointChange;

    if (updatedPointTotal < 0) {
        return {
            result: "not enough points" as const,
        };
    }

    await createPointChange(
        ctx,
        driverUserId,
        organizationId,
        changedByUserId,
        pointChange,
        reason,
        Date.now()
    );

    await setPointTotal(
        ctx,
        driverUserId,
        organizationId,
        updatedPointTotal
    );

    return {
        result: "success" as const,
    };
}

export async function updatePointTransferRequest(
    ctx: MutationCtx,
    transferRequestId: string,
    updateType: "approve" | "deny" | "cancel"
) {
    const transferRequest = await getPointTransferRequestById(ctx, transferRequestId);

    if (!transferRequest) {
        throw new Error("Point transfer request not found");
    }

    if (updateType === "deny") {
        await updatePointTransferRequestStatus(ctx, transferRequestId, "denied");

        return {
            result: "transfer request was denied",
        } as const;
    }

    if (updateType === "cancel") {
        await updatePointTransferRequestStatus(ctx, transferRequestId, "cancelled");

        return {
            result: "transfer request has been cancelled",
        } as const;
    }

    const outgoingTransferResult = await updatePoints(
        ctx,
        transferRequest.requestedUserId,
        transferRequest.organizationId,
        transferRequest.requestingUserId,
        transferRequest.pointsRequested * -1,
        `Outgoing Transfer - ${transferRequest.reason}`
    );

    if (outgoingTransferResult.result === "not enough points") {
        return {
            result: "You do not have enough points to fulfill this request",
        } as const;
    }

    await updatePoints(
        ctx,
        transferRequest.requestingUserId,
        transferRequest.organizationId,
        transferRequest.requestedUserId,
        transferRequest.pointsRequested,
        `Incoming Transfer - ${transferRequest.reason}`
    );

    await updatePointTransferRequestStatus(ctx, transferRequestId, "approved");

    return {
        result: "success",
    } as const;
}