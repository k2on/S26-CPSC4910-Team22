"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrg } from "../org/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export function DriverApplications() {
    const org = useOrg();
    const list = useQuery(api.organization.application.list, { orgId: org._id });

    return <Card>
        <CardHeader>
            <CardTitle>New Applications</CardTitle>
            <CardDescription>Here are all the people who would like to your the organization.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={list || []} />
        </CardContent>
    </Card>
}
