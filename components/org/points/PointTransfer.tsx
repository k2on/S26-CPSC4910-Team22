"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type PointTransferProps = {
    slug: string;
};

type IncomingRequestRow = {
    id: string;
    requestingUserName: string;
    pointsRequested: number;
    reason: string;
    status: string;
};

type OutgoingRequestRow = {
    id: string;
    requestedUserName: string;
    pointsRequested: number;
    reason: string;
    status: string;
};

export function PointTransfer({ slug }: PointTransferProps) {
    const pointTransferRequests = useQuery(
        api.appFunctions.getPointTransferRequestsBySlug,
        { slug }
    );

    const updatePointTransferRequest = useMutation(
        api.appFunctions.UpdatePointTransferRequest
    );

    const createPointTransferRequest = useMutation(
        api.appFunctions.createPointTransferRequest
    );

    const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [points, setPoints] = useState("");
    const [email, setEmail] = useState("");
    const [reason, setReason] = useState("");
    const [createError, setCreateError] = useState("");
    const [isCreatingRequest, setIsCreatingRequest] = useState(false);

    async function handleUpdateRequest(
        transferRequestId: string,
        updateType: "approve" | "deny" | "cancel"
    ) {
        const actionKey = `${transferRequestId}-${updateType}`;
        setActiveActionKey(actionKey);

        try {
            const response = await updatePointTransferRequest({
                transferRequestId,
                updateType,
            });

            toast(response.result, { position: "top-right" });
        } catch (error) {
            toast(
                error instanceof Error
                    ? error.message
                    : "Failed to update point transfer request",
                { position: "top-right" }
            );
        } finally {
            setActiveActionKey(null);
        }
    }

    function resetCreateForm() {
        setPoints("");
        setEmail("");
        setReason("");
        setCreateError("");
        setIsCreatingRequest(false);
    }

    async function handleCreateTransferRequest() {
        setCreateError("");

        const parsedPoints = Number(points);

        if (!Number.isFinite(parsedPoints) || parsedPoints <= 0) {
            setCreateError("Number of Points must be a positive number");
            return;
        }

        if (email.trim().length === 0) {
            setCreateError("Driver Email is required");
            return;
        }

        if (reason.trim().length === 0) {
            setCreateError("Reason is required");
            return;
        }

        setIsCreatingRequest(true);

        try {
            const response = await createPointTransferRequest({
                slug,
                points: parsedPoints,
                email: email.trim(),
                reason: reason.trim(),
            });

            if (response.result === "failed") {
                setCreateError(response.message);
                return;
            }

            setCreateDialogOpen(false);
            resetCreateForm();
            toast(response.message, { position: "top-right" });
        } catch (error) {
            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create transfer request"
            );
        } finally {
            setIsCreatingRequest(false);
        }
    }

    function handleDialogOpenChange(open: boolean) {
        setCreateDialogOpen(open);

        if (!open) {
            resetCreateForm();
        }
    }

    if (pointTransferRequests === undefined) {
        return (
            <div className="mt-6">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Incoming Transfer Requests</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Outgoing Transfer Requests</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    const { incomingRequests, outgoingRequests } = pointTransferRequests;

    return (
        <>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <TransferRequestTable
                    title="Incoming Transfer Requests"
                    emptyMessage="You don't have any incoming transfer requests"
                    columns={[
                        "Requested by",
                        "Points Requested",
                        "Reason",
                        "Status",
                    ]}
                    rows={incomingRequests}
                    renderRow={(row: IncomingRequestRow) => {
                        const approveKey = `${row.id}-approve`;
                        const denyKey = `${row.id}-deny`;
                        const isApproveLoading = activeActionKey === approveKey;
                        const isDenyLoading = activeActionKey === denyKey;
                        const isRowPending = row.status === "pending";
                        const isAnyActionLoading = isApproveLoading || isDenyLoading;

                        return (
                            <TableRow key={row.id}>
                                <TableCell>{row.requestingUserName}</TableCell>
                                <TableCell>{row.pointsRequested}</TableCell>
                                <TableCell>{row.reason || "—"}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell className="text-right">
                                    {isRowPending ? (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() =>
                                                    handleUpdateRequest(row.id, "approve")
                                                }
                                                disabled={isAnyActionLoading}
                                            >
                                                {isApproveLoading ? "Approving..." : "Approve"}
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    handleUpdateRequest(row.id, "deny")
                                                }
                                                disabled={isAnyActionLoading}
                                            >
                                                {isDenyLoading ? "Denying..." : "Deny"}
                                            </Button>
                                        </div>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        );
                    }}
                />

                <TransferRequestTable
                    title="Outgoing Transfer Requests"
                    emptyMessage="You haven't made any outgoing transfer requests"
                    columns={[
                        "Driver Requested",
                        "Points Requested",
                        "Reason",
                        "Status",
                    ]}
                    rows={outgoingRequests}
                    headerAction={
                        <Button type="button" onClick={() => setCreateDialogOpen(true)}>
                            Send a New Transfer Request
                        </Button>
                    }
                    renderRow={(row: OutgoingRequestRow) => {
                        const cancelKey = `${row.id}-cancel`;
                        const isCancelLoading = activeActionKey === cancelKey;
                        const isRowPending = row.status === "pending";

                        return (
                            <TableRow key={row.id}>
                                <TableCell>{row.requestedUserName}</TableCell>
                                <TableCell>{row.pointsRequested}</TableCell>
                                <TableCell>{row.reason || "—"}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell className="text-right">
                                    {isRowPending ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleUpdateRequest(row.id, "cancel")
                                            }
                                            disabled={isCancelLoading}
                                        >
                                            {isCancelLoading ? "Cancelling..." : "Cancel"}
                                        </Button>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        );
                    }}
                />
            </div>

            <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Transfer Request</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Number of Points</label>
                            <Input
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                placeholder="Enter number of points..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Driver Email</label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter driver email..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason</label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason..."
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <Button
                                type="button"
                                onClick={handleCreateTransferRequest}
                                disabled={isCreatingRequest}
                                className="w-full"
                            >
                                {isCreatingRequest ? "Sending..." : "Send Request"}
                            </Button>

                            {createError ? (
                                <p className="text-sm text-destructive">{createError}</p>
                            ) : null}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function TransferRequestTable<T>({
                                     title,
                                     emptyMessage,
                                     columns,
                                     rows,
                                     renderRow,
                                     headerAction,
                                 }: {
    title: string;
    emptyMessage: string;
    columns: string[];
    rows: T[];
    renderRow: (row: T) => React.ReactNode;
    headerAction?: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <CardTitle>{title}</CardTitle>
                    {headerAction}
                </div>
            </CardHeader>

            <CardContent>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead key={column}>{column}</TableHead>
                                    ))}
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>{rows.map(renderRow)}</TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}