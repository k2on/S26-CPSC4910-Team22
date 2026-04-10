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