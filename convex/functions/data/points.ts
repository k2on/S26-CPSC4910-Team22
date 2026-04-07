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