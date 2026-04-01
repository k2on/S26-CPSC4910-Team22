"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { columns, DriverRow } from "../manage-organization/columns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Props = {
    slug: string;
};

export function OrganizationDriverStatusChart({ slug }: Props) {
    const drivers = useQuery(api.myFunctions.getVisibleOrganizationDriversBySlug, { slug });

    const summary = useMemo(() => {
        const rows = drivers ?? [];

        return {
            total: rows.length,
            active: rows.filter((driver) => driver.active).length,
            inactive: rows.filter((driver) => !driver.active).length,
            suspended: rows.filter((driver) => driver.suspended).length,
        };
    }, [drivers]);

    if (drivers === undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Manage Organization</CardTitle>
                    <CardDescription>Loading driver information...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const rows: DriverRow[] = drivers;
    const actionColumn = columns.find((column) => column.id === "actions");

    return (
        <Card className="mt-8">
            <CardHeader className="gap-4">
                <div>
                    <CardTitle>Manage Organization</CardTitle>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Total Drivers: {summary.total}</Badge>
                    <Badge variant="outline">Active: {summary.active}</Badge>
                    <Badge variant="outline">Inactive: {summary.inactive}</Badge>
                    <Badge variant="outline">Suspended: {summary.suspended}</Badge>
                </div>
            </CardHeader>

            <CardContent>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No drivers are currently associated with this organization.
                    </p>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead>Suspended</TableHead>
                                    <TableHead>Suspension End</TableHead>
                                    <TableHead>Deactivation Reason</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.userId}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>{row.points}</TableCell>
                                        <TableCell>
                                            {columns[3].cell
                                                ? columns[3].cell({
                                                    row: { original: row },
                                                } as never)
                                                : null}
                                        </TableCell>
                                        <TableCell>
                                            {columns[4].cell
                                                ? columns[4].cell({
                                                    row: { original: row },
                                                } as never)
                                                : null}
                                        </TableCell>
                                        <TableCell>
                                            {row.suspensionEnd
                                                ? new Date(row.suspensionEnd).toLocaleDateString()
                                                : "—"}
                                        </TableCell>
                                        <TableCell>{row.banReason || "—"}</TableCell>
                                        <TableCell className="text-right">
                                            {actionColumn?.cell
                                                ? actionColumn.cell({
                                                    row: { original: row },
                                                } as never)
                                                : null}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}