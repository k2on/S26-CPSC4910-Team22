"use client";

import { ColumnDef } from "@tanstack/react-table";

export type DriverPointChangeRow = {
    id: string;
    driverName: string;
    driverEmail: string;
    changedByName: string;
    pointChange: number;
    reason: string;
    time: number;
};

export const columns: ColumnDef<DriverPointChangeRow>[] = [
    {
        accessorKey: "driverName",
        header: "Driver Name",
    },
    {
        accessorKey: "driverEmail",
        header: "Driver Email",
    },
    {
        accessorKey: "changedByName",
        header: "Changed By",
    },
    {
        accessorKey: "pointChange",
        header: "Point Change",
        cell: ({ row }) => {
            const value = row.original.pointChange;
            return value > 0 ? `+${value}` : `${value}`;
        },
    },
    {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => {
            return row.original.reason || "—";
        },
    },
    {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => {
            return new Date(row.original.time).toLocaleString();
        },
    },
];