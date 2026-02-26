"use client";

import { api } from "@/convex/_generated/api";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "convex/react";

export default function Page() {
  const data = useQuery(api.myFunctions.getAuditLog);

  return <div className="pt-4 max-w-2xl mx-auto">
    <DataTable columns={columns} data={data || []} />
  </div>
}
