"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationLoader } from "@/components/org/OrganizationLoader";
import { OrganizationError } from "@/components/org/Error";

type Props = {
    slug: string;
};

export function OrganizationGeneral({ slug }: Props) {
    const data = useQuery(api.myFunctions.getOrganizationGeneralBySlug, { slug });

    if (data === undefined) {
        return <OrganizationLoader />;
    }

    if (data === null) {
        return <OrganizationError error={new Error("Organization not found")} />;
    }

    if (data.role === "driver") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to {data.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>Current Points: {data.currentPoints}</p>
                    <p>Point Value: ${data.currentPointValue.toFixed(2)}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{data.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{data.totalMembers} Members</p>
            </CardContent>
        </Card>
    );
}