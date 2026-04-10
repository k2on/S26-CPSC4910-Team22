"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { createAuth } from "@/convex/betterAuth/auth";
import { api } from "@/convex/_generated/api";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Auth = ReturnType<typeof createAuth>;
type Member = Auth["$Infer"]["Member"];

export function OrganizationMembers({ slug }: { slug: string }) {
        const organization = useQuery(api.myFunctions.getVisibleOrganizationBySlug, { slug });
        const members = useQuery(api.myFunctions.getVisibleOrganizationMembersBySlug, { slug });
        const addMemberByEmail = useMutation(api.appFunctions.addOrganizationMemberByEmailBySlug);

        const [open, setOpen] = useState(false);
        const [email, setEmail] = useState("");
        const [message, setMessage] = useState("");
        const [isSubmitting, setIsSubmitting] = useState(false);

        const tableData = useMemo<Member[]>(() => {
                if (!members) return [];

                return members.map((member) => ({
                        ...member,
                        createdAt: new Date(member.createdAt),
                })) as Member[];
        }, [members]);

        async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
                e.preventDefault();

                const trimmedEmail = email.trim();
                if (!trimmedEmail) return;

                setIsSubmitting(true);
                setMessage("");

                try {
                        const result = await addMemberByEmail({
                                slug,
                                email: trimmedEmail,
                        });

                        if (result.status === "added") {
                                setMessage("User added successfully");
                                setEmail("");
                        } else if (result.status === "already_exists") {
                                setMessage(`User already in ${result.organizationName}`);
                        } else {
                                setMessage("User not found");
                        }
                } finally {
                        setIsSubmitting(false);
                }
        }

        return (
            <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                            <Dialog
                                open={open}
                                onOpenChange={(nextOpen) => {
                                        setOpen(nextOpen);
                                        if (!nextOpen) {
                                                setEmail("");
                                                setMessage("");
                                        }
                                }}
                            >
                                    <DialogTrigger asChild>
                                            <Button>Add Member</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                            <DialogHeader>
                                                    <DialogTitle>Add Member</DialogTitle>
                                                    <DialogDescription>
                                                            Enter the email of the user you want to add to {organization?.name ?? "this organization"}.
                                                    </DialogDescription>
                                            </DialogHeader>

                                            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                                                    <Input
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="Email"
                                                        disabled={isSubmitting}
                                                    />
                                                    <Button type="submit" disabled={isSubmitting || !email.trim()}>
                                                            Submit
                                                    </Button>
                                            </form>

                                            {message ? <p className="text-sm">{message}</p> : null}
                                    </DialogContent>
                            </Dialog>
                    </div>

                    <DataTable columns={columns} data={tableData} />
            </div>
        );
}