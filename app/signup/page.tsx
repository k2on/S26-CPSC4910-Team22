"use client";

import {Button} from "@/components/ui/button";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";
import {useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {validateSignUp} from "@/app/inputValidation";
import {toast} from "sonner";


export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState<"driver" | "sponsor" | "admin">("driver");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profileBorder, setProfileBorder] = useState("#EDEDED");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const generateUploadUrl = useMutation(api.userProfiles.generateUploadUrl);
    const createUserProfile = useMutation(api.userProfiles.createUserProfile);


    const onSubmit = async () => {
        const result = validateSignUp(email, password, address);
        if (!result.valid) {
            toast.error(result.message, {position: "top-right"});
            return;
        }
        const clean_email = email.toLowerCase()

        const res = await authClient.signUp.email({name, email: clean_email, password});

        // validation here because inputValidation.ts can't see auth data
        if (res?.error) {
            if (res.error.code == "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
                toast.error("Email already in use", {
                    position: "top-right",
                });
                return;
            }
            throw new Error(res.error.message ?? "Sign up failed");
        }

        let profilePictureId: string | undefined = undefined;
        if (profilePicture) {
            const uploadUrl = await generateUploadUrl();

            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                headers: {"Content-Type": profilePicture.type},
                body: profilePicture,
            });

            if (!uploadRes.ok) {
                toast.error("Image upload failed", {position: "top-right"});
            } else{
                const {storageId} = await uploadRes.json();
                profilePictureId = storageId;
            }
        }

        await createUserProfile({
            role,
            address,
            profilePictureBorderColor: profileBorder,
            profilePictureId,
        });

        router.push("/");
    };

    return (
        <main className="max-w-lg mx-auto">
            <label className="block text-3xl font-semibold text-center mb-4"> Create an account </label>
            <div className="flex flex-col">
                <Input placeholder="Name" onChange={(e) => setName(e.target.value)}/>
                <Input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)}/>
                <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)}/>
                <Input placeholder="Mailing Address" onChange={(e) => setAddress(e.target.value)}/>


                <label className="block font-medium mb-2">Choose a profile picture:</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setProfilePicture(file);
                }}
                />

                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center px-4 py-2 w-1/3
             bg-slate-700 text-white border border-slate-700
             rounded-lg shadow-sm
             hover:bg-slate-800
             transition-colors duration-200 cursor-pointer"
                    >
                        Upload image
                    </button>

                    <Image
                        src={
                            profilePicture
                                ? URL.createObjectURL(profilePicture)
                                : "/no_profile_picture.jpg"
                        }
                        alt="Profile Preview"
                        width={128}
                        height={128}
                        className="object-cover rounded-full border-4 transition-colors duration-300"
                        style={{borderColor: profileBorder}}
                    />
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <label className="font-medium">Customize border:</label>

                    <Input type="color" className="w-16 h-10 cursor-pointer"
                           onChange={(e) => setProfileBorder(e.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <label className="block font-medium mb-2">Select a role:</label>

                    <div className="flex gap-3">
                        {(
                            [
                                {label: "Driver", value: "driver"},
                                {label: "Sponsor", value: "sponsor"},
                                {label: "Admin", value: "admin"},
                            ] as const
                        ).map((r) => {
                            const selected = role === r.value;

                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setRole(r.value)} // <- calls setRole({word on chosen button})
                                    aria-pressed={selected}
                                    className={[
                                        "flex-1 rounded-lg border px-4 py-2 font-medium transition",
                                        selected
                                            ? "bg-slate-700 text-white border-slate-700 ring-2 ring-slate-700 ring-offset-2"
                                            : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200",
                                    ].join(" ")}
                                >{r.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Button onClick={onSubmit} className="mt-4">Sign Up</Button>
                <Button asChild variant="outline">
                    <Link href="/signin">Already Have an Account? Sign In</Link>
                </Button>
            </div>
        </main>
    );
}
