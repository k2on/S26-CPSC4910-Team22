"use client";

import { authClient } from "@/lib/auth-client";
import { columns } from "./users/columns";
import { DataTable } from "./users/data-table";
import { useQuery } from "@tanstack/react-query";
import { CreateUserModel } from "./users/CreateUserModel";

export function AdminUsers() {
        const { data: users } = useQuery({
                queryKey: ["admin", "users"],
                queryFn: () => authClient.admin.listUsers({ query: {} })
        });

        return (
                <>
                        <CreateUserModel />
                        <DataTable columns={columns} data={users?.users || []} />
                </>
        )
}
