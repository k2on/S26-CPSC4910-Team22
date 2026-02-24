"use client";

import { authClient } from "@/lib/auth-client";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BetterFetchError } from "better-auth/client";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";;
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { OrganizationLoader } from "./OrganizationLoader";
import { InfoIcon } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from "../ui/input-group";

export default function OrganizationGeneral({ slug }: { slug: string }) {
        const { data: organization, isLoading } = useQuery({
                queryKey: ["orgs", slug],
                queryFn: () => authClient.organization.getFullOrganization({ query: { organizationSlug: slug } })
        });

        const form = useForm({
                defaultValues: {
                        name: organization?.name || '',
                        slug: organization?.slug || '',
                        pointValue: organization?.pointValue || 0.01
                },
                onSubmit: async ({ value }) => {
                        if (!organization) return;
                        const { slug: currentSlug, ...rest } = value;
                        const data = currentSlug === organization?.slug ? rest : value;
                        mutate({ organizationId: organization.id, data })
                },
        });

        const queryClient = useQueryClient();

        const { isPending, mutate } = useMutation({
                mutationFn: async (input: Parameters<typeof authClient.organization.update>[0]) => authClient.organization.update(input),
                onSuccess: () => {
                        toast.success("Organization updated");
                        queryClient.invalidateQueries({ queryKey: ["orgs"] })
                },
                onError: (error: BetterFetchError) => {
                        if (error.error.code == "VALIDATION_ERROR") {
                                form.setErrorMap({
                                        onSubmit: {
                                                fields: parseFieldErrors(error.error.message)
                                        }
                                })
                        } else {
                                toast.error(error.error.message || error.message)
                        }
                }
        });

        if (isLoading) return <OrganizationLoader />;

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

                                <FieldGroup>
                                        <Button type="submit" disabled={isPending}>
                                                {isPending ? <Spinner /> : "Save"}
                                        </Button>
                                </FieldGroup>
                        </FieldGroup>

                </form>

        )
}
