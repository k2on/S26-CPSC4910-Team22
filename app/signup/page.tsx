"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { validateSignUp } from "@/app/utils/inputValidation";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { BetterFetchError } from "@better-fetch/fetch";
import { BASE_ERROR_CODES } from "better-auth";
import { parseFieldErrors } from "../utils/parseFieldErrors";

export default function Page() {
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
            name: '',
            address: '',
            profileBorder: '#EDEDED',
        },
        onSubmit: async ({ value }) => {
            mutate(value)
        },
    });


    const { isPending, mutate } = useMutation({
        mutationFn: async (input: Parameters<typeof authClient.signUp.email>[0]) => authClient.signUp.email(input),
        onError: (error: BetterFetchError) => {
            if (error.error.code == "VALIDATION_ERROR") {
                form.setErrorMap({
                    onSubmit: {
                        fields: parseFieldErrors(error.error.message)
                    }
                })

            }
        }

    })

    // const [profilePicture, setProfilePicture] = useState<File | null>(null);
    //
    // const fileInputRef = useRef<HTMLInputElement | null>(null);
    // const generateUploadUrl = useMutation(api.services.userProfiles.generateUploadUrl);

    return (
        <main className="max-w-lg mx-auto">
            <label className="block text-3xl font-semibold text-center mb-4">
                Create an account
            </label>

            <form
                className="flex flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}
            >
                <FieldGroup>
                    <form.Field
                        name="email"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        disabled={isPending}
                                        placeholder="Email"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )
                        }}
                    />
                    <form.Field
                        name="password"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        disabled={isPending}
                                        type="password"
                                        placeholder="Password"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name="name"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        disabled={isPending}
                                        placeholder="Name"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )
                        }}
                    />

                    <form.Field
                        name="address"
                        children={(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        disabled={isPending}
                                        placeholder="Address"
                                    />
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                            )
                        }}
                    />

                </FieldGroup>


                {/*   <label className="block font-medium mb-2 mt-2"> */}
                {/*       Choose a profile picture: */}
                {/*   </label> */}
                {/*   <input */}
                {/*       ref={fileInputRef} */}
                {/*       type="file" */}
                {/*       accept="image/*" */}
                {/*       className="hidden" */}
                {/*       onChange={(e) => setProfilePicture(e.target.files?.[0] ?? null)} */}
                {/*   /> */}
                {/**/}
                {/*   <div className="flex items-center gap-6"> */}
                {/*       <button */}
                {/*           type="button" */}
                {/*           onClick={(e) => { */}
                {/*               e.preventDefault(); */}
                {/*               fileInputRef.current?.click(); */}
                {/*           }} */}
                {/*           className="flex items-center justify-center px-4 py-2 w-1/3 */}
                {/* bg-slate-700 text-white border border-slate-700 rounded-lg shadow-sm */}
                {/* hover:bg-slate-800 transition-colors duration-200 cursor-pointer */}
                {/* disabled:opacity-60 disabled:cursor-not-allowed" */}
                {/*       > */}
                {/*           Upload image */}
                {/*       </button> */}
                {/**/}
                {/*       <Image */}
                {/*           src={ */}
                {/*               profilePicture */}
                {/*                   ? URL.createObjectURL(profilePicture) */}
                {/*                   : "/no_profile_picture.jpg" */}
                {/*           } */}
                {/*           alt="Profile Preview" */}
                {/*           width={128} */}
                {/*           height={128} */}
                {/*           className="object-cover rounded-full border-4 transition-colors duration-300" */}
                {/*           style={{ borderColor: profileBorder }} */}
                {/*       /> */}
                {/*   </div> */}

                {/* <div className="flex items-center gap-3 mt-4"> */}
                {/*     <label className="font-medium">Customize border:</label> */}
                {/*     <Input */}
                {/*         type="color" */}
                {/*         className="w-16 h-10 cursor-pointer" */}
                {/*         disabled={isSubmitting} */}
                {/*         onChange={(e) => setProfileBorder(e.target.value)} */}
                {/*     /> */}
                {/* </div> */}

                <Button type="submit" className="mt-4" disabled={isPending}>
                    {isPending ? "Creating..." : "Sign Up"}
                </Button>

                <Button asChild variant="link" disabled={isPending}>
                    <Link href="/signin">Already Have an Account? Sign In</Link>
                </Button>
            </form>
        </main>
    );
}
