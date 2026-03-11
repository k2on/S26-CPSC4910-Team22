"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoreHorizontal } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { BetterFetchError } from "better-auth/client";
import { toast } from "sonner";

export type DriverRow = {
    userId: string;
    name: string;
    email: string;
    points: number;
    active: boolean;
    suspended: boolean;
    suspensionEnd?: number | null;
    banReason?: string | null;
};

export const columns: ColumnDef<DriverRow>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "points",
        header: "Points",
        cell: ({ row }) => {
            return row.original.points;
        },
    },
    {
        accessorKey: "active",
        header: "Active",
        cell: ({ row }) => {
            return row.original.active ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>;
        },
    },
    {
        accessorKey: "suspended",
        header: "Suspended",
        cell: ({ row }) => {
            return row.original.suspended ? (
                <Badge variant="destructive">Yes</Badge>
            ) : (
                <Badge variant="secondary">No</Badge>
            );
        },
    },
    {
        accessorKey: "suspensionEnd",
        header: "Suspension End",
        cell: ({ row }) => {
            const suspensionEnd = row.original.suspensionEnd;

            if (!suspensionEnd) {
                return "—";
            }

            return new Date(suspensionEnd).toLocaleDateString();
        },
    },
    {
        accessorKey: "banReason",
        header: "Deactivation Reason",
        cell: ({ row }) => {
            return row.original.banReason || "—";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return <DriverActions driver={row.original} />;
        },
    },
];

function DriverActions({ driver }: { driver: DriverRow }) {
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [banReason, setBanReason] = useState("");
    const [suspensionReason, setSuspensionReason] = useState("");
    const [suspensionLength, setSuspensionLength] = useState("");
    const [suspensionUnit, setSuspensionUnit] = useState("days");
    const [suspensionError, setSuspensionError] = useState("");

    const { mutateAsync: banUser, isPending: isBanning } = useMutation({
        mutationFn: async (input: Parameters<typeof authClient.admin.banUser>[0]) =>
            authClient.admin.banUser(input),
    });

    const { mutateAsync: activateUser, isPending: isActivating } = useMutation({
        mutationFn: async (input: Parameters<typeof authClient.admin.unbanUser>[0]) =>
            authClient.admin.unbanUser(input),
    });

    const isPending = isBanning || isActivating;
    const deactivateLabel = driver.active ? "Deactivate User" : "Activate User";

    function resetDeactivateDialog() {
        setBanReason("");
        setDeactivateOpen(false);
    }

    function resetSuspendDialog() {
        setSuspensionReason("");
        setSuspensionLength("");
        setSuspensionUnit("days");
        setSuspensionError("");
        setSuspendOpen(false);
    }

    async function onSubmitDeactivate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        await toast.promise(
            () =>
                banUser({
                    userId: driver.userId,
                    banReason: banReason.trim() || "Deactivated by organization manager",
                }),
            {
                loading: "Deactivating user...",
                success: "User deactivated",
                error: (err: BetterFetchError) => err.error.message || err.message,
            }
        );

        resetDeactivateDialog();
    }

    async function onActivate() {
        await toast.promise(
            () =>
                activateUser({
                    userId: driver.userId,
                }),
            {
                loading: "Activating user...",
                success: "User activated",
                error: (err: BetterFetchError) => err.error.message || err.message,
            }
        );
    }

    async function onSubmitSuspend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const parsedLength = Number(suspensionLength);

        if (!Number.isFinite(parsedLength) || parsedLength <= 0) {
            setSuspensionError("Invalid Suspension Length");
            return;
        }

        setSuspensionError("");

        const unitSeconds: Record<string, number> = {
            minutes: 60,
            hours: 60 * 60,
            days: 60 * 60 * 24,
            weeks: 60 * 60 * 24 * 7,
        };

        const banExpiresIn = parsedLength * unitSeconds[suspensionUnit];

        await toast.promise(
            () =>
                banUser({
                    userId: driver.userId,
                    banReason: suspensionReason.trim() || "Suspended by organization manager",
                    banExpiresIn,
                }),
            {
                loading: "Suspending user...",
                success: "User suspended",
                error: (err: BetterFetchError) => err.error.message || err.message,
            }
        );

        resetSuspendDialog();
    }

    return (
        <>
            <Dialog
                open={deactivateOpen}
                onOpenChange={(nextOpen) => {
                    setDeactivateOpen(nextOpen);
                    if (!nextOpen) {
                        setBanReason("");
                    }
                }}
            >
                <Dialog
                    open={suspendOpen}
                    onOpenChange={(nextOpen) => {
                        setSuspendOpen(nextOpen);
                        if (!nextOpen) {
                            setSuspensionReason("");
                            setSuspensionLength("");
                            setSuspensionUnit("days");
                            setSuspensionError("");
                        }
                    }}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {driver.active ? (
                                <DialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        onClick={() => setDeactivateOpen(true)}
                                    >
                                        {deactivateLabel}
                                    </DropdownMenuItem>
                                </DialogTrigger>
                            ) : (
                                <DropdownMenuItem onClick={onActivate}>
                                    {deactivateLabel}
                                </DropdownMenuItem>
                            )}

                            <DialogTrigger asChild>
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={() => setSuspendOpen(true)}
                                >
                                    Suspend User
                                </DropdownMenuItem>
                            </DialogTrigger>

                            <DropdownMenuItem>Update Points</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DialogContent>
                        <form className="flex flex-col gap-4" onSubmit={onSubmitSuspend}>
                            <DialogHeader>
                                <DialogTitle>Suspend User</DialogTitle>
                                <DialogDescription>
                                    Enter a suspension reason and length for {driver.name}.
                                </DialogDescription>
                            </DialogHeader>

                            <Input
                                value={suspensionReason}
                                onChange={(e) => setSuspensionReason(e.target.value)}
                                placeholder="Suspension reason"
                                disabled={isPending}
                            />

                            <div className="flex gap-2">
                                <Input
                                    value={suspensionLength}
                                    onChange={(e) => setSuspensionLength(e.target.value)}
                                    placeholder="Length"
                                    disabled={isPending}
                                />
                                <select
                                    value={suspensionUnit}
                                    onChange={(e) => setSuspensionUnit(e.target.value)}
                                    disabled={isPending}
                                    className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                </select>
                            </div>

                            {suspensionError ? (
                                <p className="text-sm text-red-500">{suspensionError}</p>
                            ) : null}

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" disabled={isPending}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={isPending}>
                                    Submit
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <DialogContent>
                    <form className="flex flex-col gap-4" onSubmit={onSubmitDeactivate}>
                        <DialogHeader>
                            <DialogTitle>Deactivate User</DialogTitle>
                            <DialogDescription>
                                Enter a deactivation reason for {driver.name}.
                            </DialogDescription>
                        </DialogHeader>

                        <Input
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Deactivation reason"
                            disabled={isPending}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isPending}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                Submit
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}