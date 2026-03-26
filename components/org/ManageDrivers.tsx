"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DataTable } from "@/components/org/members/data-table";
import { columns, type DriverPointChangeRow } from "@/components/org/manage-drivers/columns";

export function OrganizationDrivers({ slug }: { slug: string }) {
    const pointChanges = useQuery(api.myFunctions.getVisibleOrganizationPointChangesBySlug, { slug });

    const tableData = useMemo<DriverPointChangeRow[]>(() => {
        return pointChanges ?? [];
    }, [pointChanges]);

    return (
        <div className="flex flex-col gap-4">
            <DataTable columns={columns} data={tableData} />
        </div>
    );
}