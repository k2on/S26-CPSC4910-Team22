"use client";

import { ColumnDef } from "@tanstack/react-table"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
        HatGlassesIcon,
        MoreHorizontal, UserRoundPenIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { UpdateUserDialogContent } from "@/components/admin/UpdateUser";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { type AppRole } from "@/lib/permissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BetterFetchError } from "better-auth/client";
import { toast } from "sonner";

type User = Awaited<ReturnType<typeof authClient.admin.listUsers>>["users"][number];

export const columns: ColumnDef<User>[] = [
        {
                id: "image",
                cell: ({ row }) => {
                        const { name, image, imageBorderColor } = row.original;
                        return (

                                <Avatar style={{ borderColor: imageBorderColor }} className="border">
                                        <AvatarImage src={image || ''} />
                                        <AvatarFallback>{name.at(0)}</AvatarFallback>
                                </Avatar>
                        )
                }
        },
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
                                                                <DropdownMenuItem>
                                                                        <UserRoundPenIcon />
                                                                        Update User
                                                                </DropdownMenuItem>
                                                        </DialogTrigger>
                                                        <ImpersonateUser user={user} />
                                                        {/* <DeleteUser user={member} /> */}
                                                </DropdownMenuContent>
                                        </DropdownMenu>
                                        <UpdateUserDialogContent userId={user.id} />
                                </Dialog>
                        );
                },
        },
];

function ImpersonateUser({ user }: { user: User }) {
        const { data } = authClient.useSession();

        const { mutate: impersonateUser } = useMutation({
                mutationFn: (input: Parameters<typeof authClient.admin.impersonateUser>[0]) => authClient.admin.impersonateUser(input),
                onSuccess: () => {
                        window.location.href = "/";
                },
                onError: (error: BetterFetchError) => {
                        toast.error(error.error.message || error.message);
                }
        });

        if (user.id == data?.user.id) return;

        return (

                <DropdownMenuItem onClick={() => impersonateUser({ userId: user.id })}>
                        <HatGlassesIcon />
                        Impersonate User
                </DropdownMenuItem>
        );
}
