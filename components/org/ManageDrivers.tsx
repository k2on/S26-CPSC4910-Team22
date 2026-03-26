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
import { Button } from "@/components/ui/button";

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

    function escapeCsvValue(value: string | number) {
        const stringValue = String(value);
        const escapedValue = stringValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }

    function downloadCsv() {
        const headers = [
            "Driver Name",
            "Driver Email",
            "Changed By",
            "Point Change",
            "Reason",
            "Time",
        ];

        const rows = tableData.map((row) => [
            row.driverName,
            row.driverEmail,
            row.changedByName,
            row.pointChange,
            row.reason || "—",
            new Date(row.time).toLocaleString(),
        ]);

        const csvContent = [
            headers.map(escapeCsvValue).join(","),
            ...rows.map((row) => row.map(escapeCsvValue).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `point-update-history-${slug}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

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
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle>Point Update History</CardTitle>
                    </div>

                    <Button type="button" onClick={downloadCsv}>
                        Download CSV
                    </Button>
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