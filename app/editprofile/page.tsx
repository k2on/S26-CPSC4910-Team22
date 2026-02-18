"use client";

import { authClient } from "@/lib/auth-client";
import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { validateEmail, validateAddress } from "@/app/utils/inputValidation";

export default function Page() {
    const { data, isPending } = authClient.useSession();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profileBorder, setProfileBorder] = useState("#EDEDED");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const userProfileInfo = useQuery(api.services.userProfiles.getUserProfileInfo);
    const generateUploadUrl = useMutation(api.services.userProfiles.generateUploadUrl);
    const updateUserProfile = useMutation(api.services.userProfiles.updateUserProfile);

    useEffect(() => {
        if (userProfileInfo?.profilePictureBorderColor) {
            setProfileBorder(userProfileInfo.profilePictureBorderColor);
        }
    }, [userProfileInfo?.profilePictureBorderColor]);

    const localPreviewUrl = useMemo(() => {
        if (!profilePicture) return null;
        return URL.createObjectURL(profilePicture);
    }, [profilePicture]);

    useEffect(() => {
        return () => {
            if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        };
    }, [localPreviewUrl]);

    const changeEmail = async () => {
        try {
            const result = validateEmail(email);
            if (!result.valid) {
                toast.error(result.message, { position: "top-right" });
                return;
            }
            const res = await authClient.changeEmail({
                newEmail: email,
                callbackURL: "/",
            });
            if (res?.error) {
                if (res.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
                    toast.error("Email already in use", { position: "top-right" });
                    return;
                }
            }
            toast.success("Email update successful", { position: "top-left" });
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Email update failed";
            toast.error(message, { position: "top-left" });
        }
    };

    const changeName = async () => {
        try {
            const res = await authClient.updateUser({ name });
            if (res?.error) throw new Error(res.error.message ?? "Update failed");
            toast.success("Name update successful", { position: "top-left" });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Name update failed";
            toast.error(message, { position: "top-left" });
        }
    };

    const changeAddress = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const result = validateAddress(address);
            if (!result.valid) {
                toast.error(result.message, { position: "top-right" });
                return;
            }
            await updateUserProfile({ address });
            toast.success("Address update successful", { position: "top-left" });
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Address update failed";
            toast.error(message, { position: "top-left" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const saveBorderColor = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await updateUserProfile({ profilePictureBorderColor: profileBorder });
            toast.success("Border color update successful", { position: "top-left" });
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Border color update failed";
            toast.error(message, { position: "top-left" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const changeImage = async () => {
        if (isSubmitting) return;

        const file = profilePicture;
        if (!file) {
            toast.error("No file has been selected", { position: "top-left" });
            return;
        }

        setIsSubmitting(true);
        try {
            const uploadUrl = await generateUploadUrl();

            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!uploadRes.ok) {
                toast.error("Image upload failed", { position: "top-left" });
                return;
            }

            const { storageId } = (await uploadRes.json()) as { storageId: string };

            await updateUserProfile({ profilePictureId: storageId });

            toast.success("Profile picture update successful", { position: "top-left" });

            setProfilePicture(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (e: unknown) {
            const message =
                e instanceof Error ? e.message : "Profile picture update successful";
            toast.error(message, { position: "top-left" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const disableInputs = isPending || isSubmitting;
    const convexUrl = userProfileInfo?.profilePictureUrl ?? null;

    return (
        <main className="max-w-lg mx-auto">
            <div className="flex flex-col">
                <label className="block text-3xl font-semibold text-center mb-4">
                    Edit Profile
                </label>

                <Separator />

                <div className="flex flex-col mt-4">
                    <Button asChild variant="outline">
                        <Link href="/">Back</Link>
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-2 font-medium">Account Name:</div>
                <div className="flex flex-row gap-2">
                    <Input
                        placeholder={isPending ? "Loading..." : data?.user.name}
                        type="text"
                        onChange={(e) => setName(e.target.value)}
                        disabled={disableInputs}
                    />
                    <Button onClick={() => void changeName()} disabled={disableInputs}>
                        Update Name
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-2 font-medium">Account Email:</div>
                <div className="flex flex-row gap-2">
                    <Input
                        placeholder={isPending ? "Loading..." : data?.user.email}
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={disableInputs}
                    />
                    <Button onClick={() => void changeEmail()} disabled={disableInputs}>
                        Update Email
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-2 font-medium">Mailing Address:</div>
                <div className="flex flex-row gap-2">
                    <Input
                        placeholder={isPending ? "Loading..." : userProfileInfo?.address}
                        type="text"
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={disableInputs}
                    />
                    <Button
                        onClick={() => void changeAddress()}
                        disabled={disableInputs}
                    >
                        Update Address
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <label className="block font-medium mb-2 mt-2">
                    Choose a profile picture:
                </label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={disableInputs}
                    onChange={(e) => setProfilePicture(e.target.files?.[0] ?? null)}
                />

                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        disabled={disableInputs}
                        onClick={(e) => {
                            e.preventDefault();
                            fileInputRef.current?.click();
                        }}
                        className="flex items-center justify-center px-4 py-2 w-1/3
              bg-slate-700 text-white border border-slate-700 rounded-lg shadow-sm
              hover:bg-slate-800 transition-colors duration-200 cursor-pointer
              disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        Upload image
                    </button>

                    {localPreviewUrl ? (
                        <Image
                            src={localPreviewUrl}
                            alt="Profile Preview"
                            width={128}
                            height={128}
                            className="object-cover rounded-full border-4 transition-colors duration-300"
                            style={{ borderColor: profileBorder }}
                        />
                    ) : convexUrl ? (
                        <img
                            src={convexUrl}
                            alt="Profile Preview"
                            width={128}
                            height={128}
                            className="object-cover rounded-full border-4 transition-colors duration-300"
                            style={{ borderColor: profileBorder }}
                        />
                    ) : (
                        <Image
                            src="/no_profile_picture.jpg"
                            alt="Profile Preview"
                            width={128}
                            height={128}
                            className="object-cover rounded-full border-4 transition-colors duration-300"
                            style={{ borderColor: profileBorder }}
                        />
                    )}
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <label className="font-medium">Customize border:</label>
                    <Input
                        type="color"
                        className="w-16 h-10 cursor-pointer"
                        disabled={disableInputs}
                        value={profileBorder}
                        onChange={(e) => setProfileBorder(e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disableInputs}
                        onClick={() => void saveBorderColor()}
                    >
                        Save Border
                    </Button>
                </div>

                <Button
                    type="button"
                    className="mt-4"
                    disabled={disableInputs || !profilePicture}
                    onClick={() => void changeImage()}
                >
                    {isSubmitting ? "Updating..." : "Update Image"}
                </Button>
            </div>
        </main>
    );
}
