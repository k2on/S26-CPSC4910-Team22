"use client";

import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./members/data-table";
import { columns } from "./members/columns";

export function OrganizationMembers({ slug }: { slug: string }) {
        const { data: members } = useQuery({
                queryKey: ["orgs", slug],
                queryFn: () => authClient.organization.listMembers({ query: { organizationSlug: slug } })
        })

        return (
                <div>
                        <DataTable columns={columns} data={members?.members || []} />
                </div>
        );
}
