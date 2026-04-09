"use client";

import { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";


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
                        const deny = useMutation(api.organization.application.deny);

                        const id = row.original.application._id;
                        const email = row.original.driver.email;

                        const [comment, setComment] = useState("");

                        return (
                                <div className="flex flex-row gap-2 justify-end">
                                        <Button onClick={() => approve({ id, email })}>Approve</Button>
                                        <Dialog>
                                                <DialogTrigger>
                                                        <Button>Deny</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                        <DialogHeader>
                                                                <DialogTitle>Deny Application</DialogTitle>
                                                                <DialogDescription>Deny Application</DialogDescription>
                                                        </DialogHeader>
                                                        <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Deny Reason" />
                                                        <Button onClick={() => deny({ id, comment, email })}>Deny</Button>
                                                </DialogContent>
                                        </Dialog>
                                </div>
                        )
                }
        },
];
