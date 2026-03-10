"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import type { createAuth } from "@/convex/betterAuth/auth";
import { api } from "@/convex/_generated/api";
import { DataTable } from "./members/data-table";
import { columns } from "./members/columns";

type Auth = ReturnType<typeof createAuth>;
type Member = Auth["$Infer"]["Member"];

export function OrganizationMembers({ slug }: { slug: string }) {
        const members = useQuery(api.myFunctions.getOrganizationMembersBySlug, { slug });

        const tableData = useMemo<Member[]>(() => {
                if (!members) return [];

                return members.map((member) => ({
                        ...member,
                        createdAt: new Date(member.createdAt),
                })) as Member[];
        }, [members]);

        return (
            <div>
                    <DataTable columns={columns} data={tableData} />
            </div>
        );
}