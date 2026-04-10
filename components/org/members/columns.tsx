"use client";

import { ColumnDef } from "@tanstack/react-table";

import type { createAuth } from "@/convex/betterAuth/auth";
import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuPortal,
        DropdownMenuSub,
        DropdownMenuSubContent,
        DropdownMenuSubTrigger,
        DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
        CheckIcon,
        MoreHorizontal,
        TrashIcon,
        UserRoundKeyIcon,
        UserRoundPenIcon
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { UpdateUserDialogContent } from "@/components/admin/UpdateUser";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useMutation as useConvexMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";

type Auth = ReturnType<typeof createAuth>;
type Member = Auth["$Infer"]["Member"];

// replacement for BetterFetchError
// couldn't figure out how to fix line "import { BetterFetchError } from "better-auth/client";" causing this error:
// "Export BetterFetchError doesn't exist in target module"
function getErrorMessage(error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "error" in error &&
            typeof error.error === "object" &&
            error.error !== null &&
            "message" in error.error &&
            typeof error.error.message === "string"
        ) {
                return error.error.message;
        }

        if (error instanceof Error) {
                return error.message;
        }

        return "Something went wrong";
}

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
                                                            <DropdownMenuItem>
                                                                    <UserRoundPenIcon />
                                                                    Update User
                                                            </DropdownMenuItem>
                                                    </DialogTrigger>
                                                    <UpdateMemberRole member={member} />
                                                    <DeleteMember member={member} />
                                            </DropdownMenuContent>
                                    </DropdownMenu>
                                    <UpdateUserDialogContent userId={member.userId} />
                            </Dialog>
                        );
                },
        },
];

function UpdateMemberRole({ member }: { member: Member }) {
        const queryClient = useQueryClient();

        const { mutateAsync: updateMemberRole } = useMutation({
                mutationFn: (input: Parameters<typeof authClient.organization.updateMemberRole>[0]) =>
                    authClient.organization.updateMemberRole(input),
                onSuccess() {
                        queryClient.invalidateQueries({
                                queryKey: ["orgs", member.organizationId]
                        });
                },

        });

        return (
            <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                            <UserRoundKeyIcon />
                            Change Permission
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                    {["owner", "admin", "member"].map((role) => (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                toast.promise(
                                                    () =>
                                                        updateMemberRole({
                                                                organizationId: member.organizationId,
                                                                memberId: member.id,
                                                                role
                                                        }),
                                                    {
                                                            loading: "Updating permission...",
                                                            success: "Updated permission",
                                                            error: (error: unknown) => getErrorMessage(error),
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
        const params = useParams<{ slug: string }>();
        const removeOrganizationMemberByUserIdAndSlug = useConvexMutation(
            api.appFunctions.removeOrganizationMemberByUserIdAndSlug
        );

        return (
            <DropdownMenuItem
                onClick={() =>
                    toast.promise(
                        async () => {
                                await removeOrganizationMemberByUserIdAndSlug({
                                        slug: params.slug,
                                        userId: member.userId,
                                });

                                queryClient.invalidateQueries({
                                        queryKey: ["orgs", member.organizationId],
                                });
                        },
                        {
                                loading: "Removing member...",
                                success: "Removed member",
                                error: (error: unknown) => getErrorMessage(error),
                        }
                    )
                }
                variant="destructive"
            >
                    <TrashIcon />
                    Delete Member
            </DropdownMenuItem>
        );
}