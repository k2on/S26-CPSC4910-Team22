import type { QueryCtx, MutationCtx } from "../../_generated/server";

export async function getPointTotalByDriverAndOrganizationId(
    ctx: QueryCtx | MutationCtx,
    driverUserId: string,
    organizationId: string
) {
    const pointTotals = await ctx.db.query("pointTotals").collect();

    return (
        pointTotals.find(
            (row) =>
                row.driverUserId === driverUserId &&
                row.organizationId === organizationId
        ) ?? null
    );
}

export async function getPointTotalsByOrganizationId(
    ctx: QueryCtx | MutationCtx,
    organizationId: string
) {
    return ctx.db
        .query("pointTotals")
        .withIndex("organizationId", (q) => q.eq("organizationId", organizationId))
        .collect();
}

export async function getPointTransferRequestsByRequestingUserId(
    ctx: QueryCtx | MutationCtx,
    requestingUserId: string
) {
    return ctx.db
        .query("pointTransferRequests")
        .withIndex("requestingUserId", (q) =>
            q.eq("requestingUserId", requestingUserId)
        )
        .collect();
}

export async function getPointTransferRequestsByRequestedUserId(
    ctx: QueryCtx | MutationCtx,
    requestedUserId: string
) {
    return ctx.db
        .query("pointTransferRequests")
        .withIndex("requestedUserId", (q) =>
            q.eq("requestedUserId", requestedUserId)
        )
        .collect();
}

export async function createPointTransferRequest(
    ctx: MutationCtx,
    requestingUserId: string,
    requestedUserId: string,
    organizationId: string,
    pointsRequested: number,
    reason: string,
    status: string
) {
    await ctx.db.insert("pointTransferRequests", {
        requestingUserId,
        requestedUserId,
        organizationId,
        pointsRequested,
        reason,
        status,
    });

    return null;
}

export async function createPointTotal(
    ctx: MutationCtx,
    driverUserId: string,
    organizationId: string
) {
    await ctx.db.insert("pointTotals", {
        driverUserId,
        organizationId,
        points: 0,
    });

    return null;
}

export async function setPointTotal(
    ctx: MutationCtx,
    driverUserId: string,
    organizationId: string,
    points: number
) {
    const pointTotal = await getPointTotalByDriverAndOrganizationId(
        ctx,
        driverUserId,
        organizationId
    );

    if (!pointTotal) {
        throw new Error("Point total not found");
    }

    await ctx.db.patch(pointTotal._id, {
        points,
    });

    return null;
}

export async function createPointChange(
    ctx: MutationCtx,
    driverUserId: string,
    organizationId: string,
    changedByUserId: string,
    pointChange: number,
    reason: string,
    time: number
) {
    await ctx.db.insert("pointChanges", {
        driverUserId,
        organizationId,
        changedByUserId,
        pointChange,
        reason,
        time,
    });

    return null;
}

export async function getPointChangesByOrganizationId(
    ctx: QueryCtx | MutationCtx,
    organizationId: string
) {
    const pointChanges = await ctx.db.query("pointChanges").collect();

    return pointChanges.filter((row) => row.organizationId === organizationId);
}