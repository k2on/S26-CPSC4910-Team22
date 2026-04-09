"use client";

import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";


export const columns: ColumnDef<FunctionReturnType<typeof api.organization.application.list>[number]>[] = [
        {
                accessorFn: ({ driver }) => driver.name,
                header: "Name",
        },
        {
                accessorFn: ({ driver }) => driver.email,
                header: "Email",
        },
        {
                id: "actions",
                cell: ({ row }) => {
                        const approve = useMutation(api.organization.application.approve);
                        const deny = useMutation(api.organization.application.approve);

                        const id = row.original.application._id;
                        const email = row.original.driver.email;

                        return (
                                <div className="flex flex-row gap-2 justify-end">
                                        <Button onClick={() => approve({ id, email })}>Approve</Button>
                                        <Button onClick={() => deny({ id, email })}>Deny</Button>
                                </div>
                        )
                }
        },
];
