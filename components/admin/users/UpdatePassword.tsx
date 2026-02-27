"use client";

import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { BetterFetchError } from "better-auth/client";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserPageProps } from "./sidebar/types";

export function UserUpdatePassword({ userId }: UserPageProps) {
        const form = useForm({
                defaultValues: {
                        newPassword: '',
                },
                onSubmit: async ({ value }) => {
                        mutate({ userId, newPassword: value.newPassword })
                },
        });


        const { isPending, mutate } = useMutation({
                mutationFn: async (input: Parameters<typeof authClient.admin.setUserPassword>[0]) => authClient.admin.setUserPassword(input),
                onSuccess: () => {
                        toast.success("Password updated");
                },
                onError: (error: BetterFetchError) => {
                        if (error.error.code == "VALIDATION_ERROR") {
                                form.setErrorMap({
                                        onSubmit: {
                                                fields: parseFieldErrors(error.error.message)
                                        }
                                })
                        } else {
                                toast.error(error.error.message || error.message);
                        }
                }
        });

        return (

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
                                        name="newPassword"
                                        children={(field) => {
                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                return (
                                                        <Field data-invalid={isInvalid}>
                                                                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                                                                <Input
                                                                        id={field.name}
                                                                        name={field.name}
                                                                        value={field.state.value}
                                                                        onBlur={field.handleBlur}
                                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                                        aria-invalid={isInvalid}
                                                                        disabled={isPending}
                                                                        type="password"
                                                                        placeholder="New Password"
                                                                />
                                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                        </Field>
                                                )
                                        }}
                                />

                        </FieldGroup>

                        <Button type="submit" className="mt-4" disabled={isPending}>
                                {isPending ? <Spinner /> : "Save"}
                        </Button>
                </form>
        )
}







