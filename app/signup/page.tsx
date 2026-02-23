"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { BetterFetchError } from "@better-fetch/fetch";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
        onSuccess: () => {
            router.push("/user/image");
        },
        onError: (error: BetterFetchError) => {
            if (error.error.code == "VALIDATION_ERROR") {
                form.setErrorMap({
                    onSubmit: {
                        fields: parseFieldErrors(error.error.message)
                    }
                })
            } else if (error.error.code == "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
                form.setErrorMap({
                    onSubmit: {
                        fields: {
                            email: { message: error.error.message }
                        }
                    }
                })
            }
        }

    })

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">


                    <Card>
                        <CardHeader>
                            <CardTitle>Create an account</CardTitle>
                            <CardDescription>
                                Enter your information below to create your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>


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
                                                    <FieldLabel htmlFor={field.name}>Mailing Address</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        disabled={isPending}
                                                        placeholder="Mailing Address"
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    />

                                    <FieldGroup>
                                        <Field>
                                            <Button type="submit" className="mt-4" disabled={isPending}>
                                                {isPending ? <Spinner /> : "Sign Up"}
                                            </Button>
                                            <FieldDescription className="px-6 text-center">
                                                Already have an account? <Link href="/signin">Sign in</Link>
                                            </FieldDescription>
                                        </Field>
                                    </FieldGroup>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
