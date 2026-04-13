"use client";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { Dialog, DialogTitle, DialogDescription, DialogContent, DialogHeader, DialogTrigger } from "../ui/dialog";
import {
        Combobox,
        ComboboxContent,
        ComboboxEmpty,
        ComboboxInput,
        ComboboxItem,
        ComboboxList,
} from "../ui/combobox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

export function Applications() {
        const data = useQuery(api.myFunctions.getDriverApplications);

        // return JSON.stringify(data);

        return (
                <div className="">
                        <Card className="w-full">
                                <CardHeader>
                                        <CardTitle>Driver Applications</CardTitle>
                                        <CardDescription>View all your driver applications.</CardDescription>

                                        <CardAction>
                                                <CreateApplicationDialog />
                                        </CardAction>
                                </CardHeader>
                                <CardContent>
                                        <Table>
                                                <TableHeader>
                                                        <TableRow>
                                                                <TableHead>Company</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Comment</TableHead>
                                                                <TableHead>Created At</TableHead>
                                                        </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                        {data?.map(({ application, organization }) => <TableRow key={application._id}>
                                                                <TableCell>{organization.name}</TableCell>
                                                                <TableCell>{application.status}</TableCell>
                                                                <TableCell>{application.denyComment}</TableCell>
                                                                <TableCell>{new Date(application._creationTime).toLocaleString()}</TableCell>
                                                        </TableRow>
                                                        )}
                                                </TableBody>
                                        </Table>
                                </CardContent>
                        </Card>

                </div>
        );
}

function CreateApplicationDialog() {
        const [open, setOpen] = useState(false);

        const [selected, setSelected] = useState<string | null>(null);
        const orgs = useQuery(api.myFunctions.listOrgs) || [];

        const { mutate: apply } = useMutation({
                mutationFn: useConvexMutation(api.driver.application.apply),
                onSuccess: () => setOpen(false),
                onError: (error) => {
                        toast.error(error.message);
                }
        });

        const onClick = () => {
                if (!selected) return;
                const organizationId = orgs.find(o => o.name == selected)?.id;
                if (!organizationId) return;
                apply({ organizationId })
        }

        return (
                <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                                <Button><PlusIcon /> New Application</Button>
                        </DialogTrigger>
                        <DialogContent>
                                <DialogHeader>
                                        <DialogTitle>New Application</DialogTitle>
                                        <DialogDescription>Find a company to apply to.</DialogDescription>
                                </DialogHeader>
                                <Combobox value={selected} onValueChange={setSelected} items={orgs}>
                                        <ComboboxInput placeholder="Select an organization" />
                                        <ComboboxContent className="z-50 pointer-events-auto">
                                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                <ComboboxList>
                                                        {(item: typeof orgs[number]) => (
                                                                <ComboboxItem key={item.id} value={item.name}>
                                                                        {item.name}
                                                                </ComboboxItem>
                                                        )}
                                                </ComboboxList>
                                        </ComboboxContent>
                                </Combobox>
                                <Button onClick={onClick}>Create</Button>
                        </DialogContent>
                </Dialog>
        )
}
