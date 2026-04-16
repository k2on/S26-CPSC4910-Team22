"use client";
import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
        UploadIcon,
        Building2,
        UserCheck,
        ShieldCheck,
        AlertTriangle,
        X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { IParseResult } from "@/convex/admin/bulk/types";
import { parseBulkFile } from "@/convex/admin/bulk/parse";

export function BulkUserUploadModal() {
        const [file, setFile] = useState<File>();
        const [preview, setPreview] = useState<IParseResult | null>(null);
        const [uploading, setUploading] = useState(false);

        const mkUploadUrl = useMutation(api.myFunctions.generateUploadUrl);
        const parseUploadedFile = useAction(api.admin.bulk.import.processFile);

        const handleFileSelect = useCallback(
                async (selectedFile: File | undefined) => {
                        setFile(selectedFile);
                        setPreview(null);

                        if (!selectedFile) return;

                        try {
                                const text = await selectedFile.text();
                                const result = parseBulkFile(text);
                                setPreview(result);
                        } catch {
                                toast.error("Could not read the file.");
                        }
                },
                []
        );

        const clearFile = useCallback(() => {
                setFile(undefined);
                setPreview(null);
        }, []);

        const onUpload = async () => {
                if (!file) return;
                setUploading(true);
                try {
                        const uploadUrl = await mkUploadUrl();
                        const uploadRes = await fetch(uploadUrl, {
                                method: "POST",
                                headers: { "Content-Type": file.type },
                                body: file,
                        });
                        if (!uploadRes.ok) {
                                toast.error("File upload failed");
                                return;
                        }
                        const { storageId } = (await uploadRes.json()) as {
                                storageId: Id<"_storage">;
                        };
                        const resp = await parseUploadedFile({ storageId });

                        if (resp.errors) {
                                setPreview(prev => {
                                        prev?.errors.push(...resp.errors.map(e => ({
                                                line: e.line,
                                                message: e.message,
                                                raw: "",
                                        })))
                                        return prev;
                                })
                        }

                        toast.success("Bulk import started successfully.");
                } catch {
                        toast.error("Something went wrong during upload.");
                } finally {
                        setUploading(false);
                }
        };

        const totalEntries =
                (preview?.organizations.length ?? 0) +
                (preview?.drivers.length ?? 0) +
                (preview?.sponsors.length ?? 0);

        return (
                <Dialog
                        onOpenChange={(open) => {
                                if (!open) clearFile();
                        }}
                >
                        <DialogTrigger asChild>
                                <Button variant="outline">
                                        <UploadIcon className="mr-2 h-4 w-4" /> Bulk Upload
                                </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                                <DialogHeader>
                                        <DialogTitle>Bulk User Upload</DialogTitle>
                                        <DialogDescription>
                                                Upload a pipe-delimited file to bulk create organizations, drivers,
                                                and sponsors.
                                        </DialogDescription>
                                </DialogHeader>

                                {/* File Input */}
                                <div className="flex items-center gap-2">
                                        <Input
                                                type="file"
                                                accept=".txt,.csv"
                                                onChange={(e) =>
                                                        handleFileSelect(e.target.files?.[0] ?? undefined)
                                                }
                                        />
                                        {file && (
                                                <Button variant="ghost" size="icon" onClick={clearFile}>
                                                        <X className="h-4 w-4" />
                                                </Button>
                                        )}
                                </div>

                                {/* Preview */}
                                {preview && (
                                        <div className="flex-1 overflow-y-auto space-y-4 border rounded-lg p-4 bg-muted/30">
                                                {/* Summary bar */}
                                                <div className="flex flex-wrap gap-3 text-sm">
                                                        <SummaryBadge
                                                                icon={<Building2 className="h-3.5 w-3.5" />}
                                                                label="Organizations"
                                                                count={preview.organizations.length}
                                                                color="text-blue-600 bg-blue-50 border-blue-200"
                                                        />
                                                        <SummaryBadge
                                                                icon={<UserCheck className="h-3.5 w-3.5" />}
                                                                label="Drivers"
                                                                count={preview.drivers.length}
                                                                color="text-emerald-600 bg-emerald-50 border-emerald-200"
                                                        />
                                                        <SummaryBadge
                                                                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                                                                label="Sponsors"
                                                                count={preview.sponsors.length}
                                                                color="text-violet-600 bg-violet-50 border-violet-200"
                                                        />
                                                        {preview.errors.length > 0 && (
                                                                <SummaryBadge
                                                                        icon={<AlertTriangle className="h-3.5 w-3.5" />}
                                                                        label="Errors"
                                                                        count={preview.errors.length}
                                                                        color="text-red-600 bg-red-50 border-red-200"
                                                                />
                                                        )}
                                                </div>

                                                {/* Organizations */}
                                                {preview.organizations.length > 0 && (
                                                        <PreviewSection
                                                                title="Organizations"
                                                                icon={<Building2 className="h-4 w-4 text-blue-600" />}
                                                        >
                                                                <div className="grid gap-1">
                                                                        {preview.organizations.map((org) => (
                                                                                <div
                                                                                        key={org.line}
                                                                                        className="flex items-center gap-2 text-sm py-1 px-2 rounded bg-background"
                                                                                >
                                                                                        <span className="text-muted-foreground text-xs font-mono w-8 shrink-0">
                                                                                                L{org.line}
                                                                                        </span>
                                                                                        <span className="font-medium">{org.name}</span>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </PreviewSection>
                                                )}

                                                {/* Drivers */}
                                                {preview.drivers.length > 0 && (
                                                        <PreviewSection
                                                                title="Drivers"
                                                                icon={<UserCheck className="h-4 w-4 text-emerald-600" />}
                                                        >
                                                                <UserTable users={preview.drivers} />
                                                        </PreviewSection>
                                                )}

                                                {/* Sponsors */}
                                                {preview.sponsors.length > 0 && (
                                                        <PreviewSection
                                                                title="Sponsors"
                                                                icon={<ShieldCheck className="h-4 w-4 text-violet-600" />}
                                                        >
                                                                <UserTable users={preview.sponsors} />
                                                        </PreviewSection>
                                                )}

                                                {/* Errors */}
                                                {preview.errors.length > 0 && (
                                                        <PreviewSection
                                                                title="Errors"
                                                                icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
                                                        >
                                                                <div className="grid gap-1">
                                                                        {preview.errors.map((err, idx) => (
                                                                                <div
                                                                                        key={idx}
                                                                                        className="text-sm py-2 px-2 rounded bg-red-50 border border-red-100"
                                                                                >
                                                                                        <div className="flex items-start gap-2">
                                                                                                <span className="text-muted-foreground text-xs font-mono w-8 shrink-0">
                                                                                                        L{err.line}
                                                                                                </span>
                                                                                                <div>
                                                                                                        <p className="text-red-700 font-medium">
                                                                                                                {err.message}
                                                                                                        </p>
                                                                                                        <p className="text-red-400 text-xs font-mono mt-0.5 break-all">
                                                                                                                {err.raw}
                                                                                                        </p>
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </PreviewSection>
                                                )}
                                        </div>
                                )}

                                {/* Upload Button */}
                                <Button
                                        onClick={onUpload}
                                        disabled={!file || uploading || totalEntries === 0}
                                        className="w-full"
                                >
                                        {uploading
                                                ? "Uploading…"
                                                : totalEntries > 0
                                                        ? `Upload ${totalEntries} record${totalEntries !== 1 ? "s" : ""}`
                                                        : "Upload"}
                                </Button>
                        </DialogContent>
                </Dialog>
        );
}

/* ─── Sub-components ─── */

function SummaryBadge({
        icon,
        label,
        count,
        color,
}: {
        icon: React.ReactNode;
        label: string;
        count: number;
        color: string;
}) {
        return (
                <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${color}`}
                >
                        {icon}
                        {count} {label}
                </span>
        );
}

function PreviewSection({
        title,
        icon,
        children,
}: {
        title: string;
        icon: React.ReactNode;
        children: React.ReactNode;
}) {
        return (
                <div>
                        <div className="flex items-center gap-2 mb-2">
                                {icon}
                                <h4 className="text-sm font-semibold">{title}</h4>
                        </div>
                        {children}
                </div>
        );
}

function UserTable({ users }: { users: IParseResult['drivers'] }) {
        return (
                <div className="rounded border overflow-hidden">
                        <table className="w-full text-sm">
                                <thead>
                                        <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
                                                <th className="py-1.5 px-2 w-10">Line</th>
                                                <th className="py-1.5 px-2">Org</th>
                                                <th className="py-1.5 px-2">Name</th>
                                                <th className="py-1.5 px-2">Email</th>
                                                <th className="py-1.5 px-2 w-16 text-right">Pts</th>
                                                <th className="py-1.5 px-2">Reason</th>
                                        </tr>
                                </thead>
                                <tbody>
                                        {users.map((u) => (
                                                <tr
                                                        key={u.line}
                                                        className="border-t border-muted hover:bg-muted/20 transition-colors"
                                                >
                                                        <td className="py-1.5 px-2 text-xs font-mono text-muted-foreground">
                                                                {u.line}
                                                        </td>
                                                        <td className="py-1.5 px-2 truncate max-w-[120px]">
                                                                {u.orgName || (
                                                                        <span className="text-muted-foreground italic">—</span>
                                                                )}
                                                        </td>
                                                        <td className="py-1.5 px-2">
                                                                {u.firstName} {u.lastName}
                                                        </td>
                                                        <td className="py-1.5 px-2 text-muted-foreground">{u.email}</td>
                                                        <td className="py-1.5 px-2 text-right tabular-nums">
                                                                {u.points ?? (
                                                                        <span className="text-muted-foreground">—</span>
                                                                )}
                                                        </td>
                                                        <td className="py-1.5 px-2 truncate max-w-[140px]">
                                                                {u.reason || (
                                                                        <span className="text-muted-foreground">—</span>
                                                                )}
                                                        </td>
                                                </tr>
                                        ))}
                                </tbody>
                        </table>
                </div>
        );
}
