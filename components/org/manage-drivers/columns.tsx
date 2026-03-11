"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export type DriverRow = {
    userId: string;
    name: string;
    email: string;
    points: number;
    active: boolean;
    suspended: boolean;
    suspensionEnd?: number | null;
};

export const columns: ColumnDef<DriverRow>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "points",
        header: "Points",
        cell: ({ row }) => {
            return row.original.points;
        },
    },
    {
        accessorKey: "active",
        header: "Active",
        cell: ({ row }) => {
            return row.original.active ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>;
        },
    },
    {
        accessorKey: "suspended",
        header: "Suspended",
        cell: ({ row }) => {
            return row.original.suspended ? (
                <Badge variant="destructive">Yes</Badge>
            ) : (
                <Badge variant="secondary">No</Badge>
            );
        },
    },
    {
        accessorKey: "suspensionEnd",
        header: "Suspension End",
        cell: ({ row }) => {
            const suspensionEnd = row.original.suspensionEnd;

            if (!suspensionEnd) {
                return "—";
            }

            return new Date(suspensionEnd).toLocaleDateString();
        },
    },
    {
        id: "actions",
        cell: () => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Deactivate User</DropdownMenuItem>
                        <DropdownMenuItem>Suspend User</DropdownMenuItem>
                        <DropdownMenuItem>Update Points</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];