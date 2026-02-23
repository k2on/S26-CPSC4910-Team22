"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { BetterFetchError } from "@better-fetch/fetch";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { Spinner } from "@/components/ui/spinner";

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
            }
        }

    })

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

                </FieldGroup>

                <Button type="submit" className="mt-4" disabled={isPending}>
                    {isPending ? <Spinner /> : "Sign Up"}
                </Button>

                <Button asChild variant="link" disabled={isPending}>
                    <Link href="/signin">Already Have an Account? Sign In</Link>
                </Button>
            </form>
        </main>
    );
}
