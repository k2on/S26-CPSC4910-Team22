"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { AppRole } from "@/lib/permissions";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BetterFetchError } from "better-auth/client";
import { PlusIcon, UserPlus2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateUserModel() {
        const router = useRouter();

        const form = useForm({
                defaultValues: {
                        email: '',
                        password: '',
                        name: '',
                        role: 'driver' as AppRole,
                },
                onSubmit: async ({ value }) => {
                        mutate(value)
                },
        });

        const queryClient = useQueryClient();

        const { isPending, mutate } = useMutation({
                mutationFn: async (input: Parameters<typeof authClient.admin.createUser>[0]) => authClient.admin.createUser(input),
                onSuccess: () => {
                        toast.success("User created");
                        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
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
        });


        return (
                <Dialog>
                        <DialogTrigger asChild>
                                <Button><UserPlus2Icon /> Create User</Button>
                        </DialogTrigger>
                        <DialogContent>
                                <form
                                        className="flex flex-col"
                                        onSubmit={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                form.handleSubmit();
                                        }}
                                >
                                        <DialogHeader>
                                                <DialogTitle>Create User</DialogTitle>
                                                <DialogDescription>Enter the information for a user.</DialogDescription>
                                        </DialogHeader>

                                        <FieldGroup>
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
                                                        name="slug"
                                                        children={(field) => {
                                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                                return (
                                                                        <Field data-invalid={isInvalid}>
                                                                                <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                                                                                <Input
                                                                                        id={field.name}
                                                                                        name={field.name}
                                                                                        value={field.state.value}
                                                                                        onBlur={field.handleBlur}
                                                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                                                        aria-invalid={isInvalid}
                                                                                        disabled={isPending}
                                                                                        placeholder="Slug"
                                                                                />
                                                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                                        </Field>
                                                                )
                                                        }}
                                                />

                                                <form.Field
                                                        name="pointValue"
                                                        validators={{
                                                                onChange: ({ value }) => value <= 0 ? { message: "Must be greater than $0.00" } : undefined
                                                        }}
                                                        children={(field) => {
                                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                                return (
                                                                        <Field data-invalid={isInvalid}>
                                                                                <FieldLabel htmlFor={field.name}>Point value</FieldLabel>
                                                                                <InputGroup>
                                                                                        <InputGroupInput
                                                                                                id={field.name}
                                                                                                name={field.name}
                                                                                                value={field.state.value}
                                                                                                onBlur={field.handleBlur}
                                                                                                type="number"
                                                                                                onChange={(e) => field.handleChange(e.target.value === '' ? '' as unknown as number : parseFloat(e.target.value))}
                                                                                                aria-invalid={isInvalid}
                                                                                                disabled={isPending}
                                                                                                placeholder="Point Value"
                                                                                        />
                                                                                        <InputGroupAddon>
                                                                                                <InputGroupText>$</InputGroupText>
                                                                                        </InputGroupAddon>
                                                                                </InputGroup>


                                                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                                        </Field>
                                                                )
                                                        }}
                                                />

                                        </FieldGroup>

                                        <DialogFooter className="mt-4">
                                                <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <Button type="submit" disabled={isPending}>
                                                        {isPending ? <Spinner /> : "Create"}
                                                </Button>
                                        </DialogFooter>
                                </form>
                        </DialogContent>
                </Dialog>
        );
}
