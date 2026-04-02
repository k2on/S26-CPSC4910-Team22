"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import {
        useAction,
        useMutation } from "convex/react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function BulkUserUploadModal() {
        const [file, setFile] = useState<File>();
        const mkUploadUrl = useMutation(api.myFunctions.generateUploadUrl);
        const parseUploadedFile = useAction(api.admin.user.processBulkImport);

        const onUpload = async () => {
                if (!file) return;

                const uploadUrl = await mkUploadUrl();

                const uploadRes = await fetch(uploadUrl, {
                        method: "POST",
                        headers: { "Content-Type": file.type },
                        body: file,
                });
                if (!uploadRes.ok) return toast.error("File upload failed");
                const { storageId } = await uploadRes.json() as { storageId: Id<"_storage"> };

                parseUploadedFile({ storageId });
        };

        return (
                <Dialog>
                        <DialogTrigger asChild>
                                <Button variant="outline"><UploadIcon /> Bulk Upload</Button>
                        </DialogTrigger>
                        <DialogContent>
                                <DialogHeader>
                                        <DialogTitle>Bulk User Upload</DialogTitle>
                                        <DialogDescription>Please upload a file with all the users.</DialogDescription>
                                </DialogHeader>
                                <Input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] ?? undefined)}
                                />
                                <Button onClick={onUpload}>Upload</Button>
                        </DialogContent>
                </Dialog>
        );
}
