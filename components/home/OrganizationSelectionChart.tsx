"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CreateOrganizationModel } from "@/components/home/CreateOrganizationModel";

export type OrganizationSelectionRole = "admin" | "sponsor" | "driver";

export type OrganizationSelectionRow = {
    name: string;
    slug: string;
    totalMembers?: number;
    inOrganization?: "Yes" | "No";
    points?: number;
};

export type OrganizationSelectionData = {
    role: OrganizationSelectionRole;
    rows: OrganizationSelectionRow[];
};

export type ColumnsByRole = Record<OrganizationSelectionRole, string[]>;

const columnsByRole: ColumnsByRole = {
    admin: ["Name", "Total Members", "In Organization"],
    sponsor: ["Name", "Total Members"],
    driver: ["Name"],
};

export function OrganizationSelectionChart() {
    const router = useRouter();
    const data = useQuery(api.myFunctions.getOrganizationSelectionData);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

    const role: OrganizationSelectionRole = data?.role ?? "driver";
    const rows: OrganizationSelectionRow[] = data?.rows ?? [];
    const canCreateOrganization = role === "admin" || role === "sponsor";

    const selectedRow = useMemo(
        () => rows.find((row) => row.slug === selectedSlug) ?? null,
        [rows, selectedSlug]
    );

    const handleSelectOrganization = () => {
        if (!selectedRow) {
            return;
        }

        router.push(`/${selectedRow.slug}`);
    };

    if (data === undefined) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>Organizations</CardTitle>
                    <div className="flex items-center gap-2">
                        {canCreateOrganization && <CreateOrganizationModel />}
                        <Button disabled>Select Organization</Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading organizations...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle>Organizations</CardTitle>

                <div className="flex items-center gap-2">
                    {canCreateOrganization && <CreateOrganizationModel />}
                    <Button onClick={handleSelectOrganization} disabled={!selectedRow}>
                        Select Organization
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No organizations are available for this account.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columnsByRole[role].map((columnName) => (
                                    <TableHead key={columnName}>{columnName}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {rows.map((row) => {
                                const isSelected = row.slug === selectedSlug;

                                return (
                                    <TableRow
                                        key={row.slug}
                                        className={`cursor-pointer ${isSelected ? "bg-muted" : ""}`}
                                        onClick={() => setSelectedSlug(row.slug)}
                                    >
                                        <TableCell>{row.name}</TableCell>

                                        {role === "admin" && (
                                            <>
                                                <TableCell>{row.totalMembers ?? 0}</TableCell>
                                                <TableCell>{row.inOrganization ?? "No"}</TableCell>
                                            </>
                                        )}

                                        {role === "sponsor" && (
                                            <TableCell>{row.totalMembers ?? 0}</TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}