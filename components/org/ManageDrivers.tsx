"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { SlidersHorizontalIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";

export function OrganizationDrivers({ slug }: { slug: string }) {
    const [showFilters, setShowFilters] = useState(false);
    const [driverNameSearch, setDriverNameSearch] = useState("");
    const [driverEmailSearch, setDriverEmailSearch] = useState("");
    const [changedBySearch, setChangedBySearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const pointChanges = useQuery(api.myFunctions.getVisibleOrganizationPointChangesBySlug, { slug });

    const tableData = useMemo<DriverPointChangeRow[]>(() => {
        const history = pointChanges ?? [];

        const normalizedDriverNameSearch = driverNameSearch.trim().toLowerCase();
        const normalizedDriverEmailSearch = driverEmailSearch.trim().toLowerCase();
        const normalizedChangedBySearch = changedBySearch.trim().toLowerCase();

        const startTime = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
        const endTime = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null;

        return history.filter((row) => {
            const matchesDriverName =
                normalizedDriverNameSearch.length === 0 ||
                row.driverName.toLowerCase().includes(normalizedDriverNameSearch);

            const matchesDriverEmail =
                normalizedDriverEmailSearch.length === 0 ||
                row.driverEmail.toLowerCase().includes(normalizedDriverEmailSearch);

            const matchesChangedBy =
                normalizedChangedBySearch.length === 0 ||
                row.changedByName.toLowerCase().includes(normalizedChangedBySearch);

            const matchesStartDate = startTime === null || row.time >= startTime;
            const matchesEndDate = endTime === null || row.time <= endTime;

            return (
                matchesDriverName &&
                matchesDriverEmail &&
                matchesChangedBy &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [pointChanges, driverNameSearch, driverEmailSearch, changedBySearch, startDate, endDate]);

    const summary = useMemo(() => {
        const currentPointTotal = tableData.reduce((sum, row) => sum + row.pointChange, 0);
        const totalPointsGained = tableData
            .filter((row) => row.pointChange > 0)
            .reduce((sum, row) => sum + row.pointChange, 0);
        const totalPointsLost = tableData
            .filter((row) => row.pointChange < 0)
            .reduce((sum, row) => sum + Math.abs(row.pointChange), 0);

        return {
            currentPointTotal,
            totalPointsGained,
            totalPointsLost,
        };
    }, [tableData]);

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

    if (pointChanges === undefined) {
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

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFilters((prev) => !prev)}
                        >
                            <SlidersHorizontalIcon />
                            {showFilters ? "Hide Search Options" : "Show Search Options"}
                        </Button>

                        <Button type="button" onClick={downloadCsv}>
                            Download CSV
                        </Button>
                    </div>
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

                {showFilters && (
                    <div className="rounded-md border bg-muted/30 p-4">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Driver Name</label>
                                <Input
                                    value={driverNameSearch}
                                    onChange={(e) => setDriverNameSearch(e.target.value)}
                                    placeholder="Search driver name..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Driver Email</label>
                                <Input
                                    value={driverEmailSearch}
                                    onChange={(e) => setDriverEmailSearch(e.target.value)}
                                    placeholder="Search driver email..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Changed By</label>
                                <Input
                                    value={changedBySearch}
                                    onChange={(e) => setChangedBySearch(e.target.value)}
                                    placeholder="Search changed by..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                <DataTable columns={columns} data={tableData} />
            </CardContent>
        </Card>
    );
}