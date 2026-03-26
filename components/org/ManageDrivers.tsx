"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DataTable } from "@/components/org/members/data-table";
import { columns, type DriverPointChangeRow } from "@/components/org/manage-drivers/columns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function OrganizationDrivers({ slug }: { slug: string }) {
    const pointChanges = useQuery(api.myFunctions.getVisibleOrganizationPointChangesBySlug, { slug });
    const drivers = useQuery(api.myFunctions.getVisibleOrganizationDriversBySlug, { slug });

    const tableData = useMemo<DriverPointChangeRow[]>(() => {
        return pointChanges ?? [];
    }, [pointChanges]);

    const summary = useMemo(() => {
        const history = pointChanges ?? [];
        const visibleDrivers = drivers ?? [];

        const currentPointTotal = visibleDrivers.reduce((sum, driver) => sum + driver.points, 0);
        const totalPointsGained = history
            .filter((change) => change.pointChange > 0)
            .reduce((sum, change) => sum + change.pointChange, 0);
        const totalPointsLost = history
            .filter((change) => change.pointChange < 0)
            .reduce((sum, change) => sum + Math.abs(change.pointChange), 0);

        return {
            currentPointTotal,
            totalPointsGained,
            totalPointsLost,
        };
    }, [pointChanges, drivers]);

    if (pointChanges === undefined || drivers === undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Point Update History</CardTitle>
                    <CardDescription>Loading point update history...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="mt-8">
            <CardHeader className="gap-4">
                <div>
                    <CardTitle>Point Update History</CardTitle>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                        Current Point Total: {summary.currentPointTotal}
                    </Badge>
                    <Badge variant="outline">
                        Total Points Gained: {summary.totalPointsGained}
                    </Badge>
                    <Badge variant="outline">
                        Total Points Lost: {summary.totalPointsLost}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <DataTable columns={columns} data={tableData} />
            </CardContent>
        </Card>
    );
}