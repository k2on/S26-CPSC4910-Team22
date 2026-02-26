"use client"

import { Doc } from "@/convex/_generated/dataModel"
import { ColumnDef } from "@tanstack/react-table"


export const columns: ColumnDef<Doc<"auditLog">>[] = [
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "event",
    header: "Event",
  },
]
