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

type Auth = ReturnType<typeof createAuth>;
type Member = Auth["$Infer"]["Member"];


export const columns: ColumnDef<Member>[] = [
        {
                accessorFn: (member) => member.user.name,
                header: "Name",
        },
        {
                accessorFn: (member) => member.user.email,
                header: "Email",
        },
        {
                accessorFn: (member) => member.role,
                header: "Role",
                cell: ({ row }) => {
                        const role = row.original.role;
                        switch (role) {
                                case "owner":
                                        return <Badge variant="destructive">Owner</Badge>;
                                case "admin":
                                        return <Badge variant="destructive">Admin</Badge>;
                                case "member":
                                        return <Badge>Member</Badge>;
                                default:
                                        const exhaustiveCheck: never = role;
                                        throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
                        }
                },
        },
        {
                id: "actions",
                cell: ({ row }) => {
                        const member = row.original;

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
                                                        <UpdateMemberRole member={member} />
                                                        <DeleteMember member={member} />
                                                </DropdownMenuContent>
                                        </DropdownMenu>
                                        <UpdateUserDialogContent />
                                </Dialog>
                        );
                },
        },
];

function UpdateMemberRole({ member }: { member: Member }) {
        const queryClient = useQueryClient();

        const { mutateAsync: updateMemberRole } = useMutation({
                mutationFn: (input: Parameters<typeof authClient.organization.updateMemberRole>[0]) => authClient.organization.updateMemberRole(input),
                onSuccess() {
                        queryClient.invalidateQueries({
                                queryKey: ["orgs", member.organizationId]
                        });
                },

        });

        return (
                <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Change Permission</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                        {["owner", "admin", "member"].map((role) => (
                                                <DropdownMenuItem
                                                        onClick={() =>
                                                                toast.promise(
                                                                        () => updateMemberRole({ organizationId: member.organizationId, memberId: member.id, role }),
                                                                        {
                                                                                loading: "Updating permission...",
                                                                                success: "Updated permission",
                                                                                error: (err: BetterFetchError) => err.error.message,
                                                                        },
                                                                )
                                                        }
                                                        key={role}
                                                >
                                                        {member.role == role ? <CheckIcon /> : <div className="w-4" />}
                                                        {role[0].toUpperCase() + role.substring(1)}
                                                </DropdownMenuItem>
                                        ))}
                                </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                </DropdownMenuSub>
        );
}

function DeleteMember({ member }: { member: Member }) {
        const queryClient = useQueryClient();
        const { mutateAsync: removeMember } = useMutation({
                mutationFn: (input: Parameters<typeof authClient.organization.removeMember>[0]) => authClient.organization.removeMember(input),
                onSuccess() {
                        queryClient.invalidateQueries({
                                queryKey: ["orgs", member.organizationId]
                        });
                },
        });

        return (
                <DropdownMenuItem
                        onClick={() =>
                                toast.promise(() => removeMember({ organizationId: member.organizationId, memberIdOrEmail: member.id }), {
                                        loading: "Removing member...",
                                        success: "Removed member",
                                        error: (err: BetterFetchError) => err.error.message,
                                })
                        }
                        variant="destructive"
                >
                        Delete Member
                </DropdownMenuItem>
        );
}
