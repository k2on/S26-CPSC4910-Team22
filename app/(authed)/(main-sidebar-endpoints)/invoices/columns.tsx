"use client";

import { Doc } from "@/convex/_generated/dataModel"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Doc<"sponsorFees">>[] = [
    {
        accessorKey: "time",
        header: "Date",
        cell: ({ row }) => {
            const time = row.getValue("time") as number;
            return time ? new Date(time).toLocaleDateString() : "--";
        }
    },
    {
        accessorKey: "userEmail",
        header: "Purchased By",
    },
    {
        accessorKey: "feeAmount",
        header: "Fee",
        cell: ({ row }) => {
            const amount = row.getValue("feeAmount") as number;
            return amount ? `$${amount.toFixed(2)}` : "$0.00";
        }
    },
    {
        accessorKey: "totalDue",
        header: "Organization Total Balance",
        cell: ({ row }) => {
            const total = row.getValue("totalDue") as number;
            return total ? `$${total.toFixed(2)}` : "$0.00";
        }
    },
    {
        accessorKey: "organizationName",
        header: "Organization"
    }
]