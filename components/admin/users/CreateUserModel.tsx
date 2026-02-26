"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { AppRole, roles } from "@/lib/permissions";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { titleCase } from "@/utils/titleCase";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BetterFetchError } from "better-auth/client";
import { UserPlus2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CreateUserModel() {
        const [open, setOpen] = useState(false);

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
                        setOpen(false);
                        form.reset();
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
                <Dialog open={open} onOpenChange={setOpen}>
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
                                                        name="role"
                                                        children={(field) => {
                                                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                                                return (
                                                                        <Field data-invalid={isInvalid}>
                                                                                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                                                                                <Select
                                                                                        name={field.name}
                                                                                        value={field.state.value}
                                                                                        onValueChange={(val: AppRole) => field.handleChange(val)}
                                                                                        disabled={isPending}
                                                                                >
                                                                                        <SelectTrigger>
                                                                                                <SelectValue placeholder="Select Role" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                                <SelectGroup>
                                                                                                        {Object.keys(roles).map(role => (
                                                                                                                <SelectItem key={role} value={role}>{titleCase(role)}</SelectItem>

                                                                                                        ))}
                                                                                                </SelectGroup>
                                                                                        </SelectContent>
                                                                                </Select>
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
