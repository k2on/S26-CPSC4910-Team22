"use client";

import { ColumnDef } from "@tanstack/react-table"

import type { createAuth } from "@/convex/betterAuth/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckIcon, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { BetterFetchError } from "better-auth/client";
import { UpdateUserDialogContent } from "@/components/admin/UpdateUser";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserIdentity } from "convex/server";
import { UserWithRole } from "better-auth/plugins";
import { type AppRole } from "@/lib/permissions";

type User = Awaited<ReturnType<typeof authClient.admin.listUsers>>["users"][number];

export const columns: ColumnDef<User>[] = [
        {
                accessorFn: (user) => user.name,
                header: "Name",
        },
        {
                accessorFn: (user) => user.email,
                header: "Email",
        },
        {
                accessorFn: (user) => user.role,
                header: "User Type",
                cell: ({ row }) => {
                        const role = row.original.role as AppRole;
                        switch (role) {
                                case "admin":
                                        return <Badge variant="destructive">Admin</Badge>;
                                case "sponsor":
                                        return <Badge variant="secondary">Sponsor</Badge>;
                                case "driver":
                                        return <Badge>Driver</Badge>;
                                default:
                                        const exhaustiveCheck: never = role;
                                        throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
                        }
                },
        },
        {
                id: "actions",
                cell: ({ row }) => {
                        const user = row.original;

                        return (
                                <Dialog>
                                        <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal />
                                                        </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                        <DialogTrigger asChild>
                                                                <DropdownMenuItem>Update User</DropdownMenuItem>
                                                        </DialogTrigger>
                                                        {/* <DeleteUser user={member} /> */}
                                                </DropdownMenuContent>
                                        </DropdownMenu>
                                        <UpdateUserDialogContent />
                                </Dialog>
                        );
                },
        },
];
