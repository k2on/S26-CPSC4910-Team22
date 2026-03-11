"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { OrganizationLoader } from "./OrganizationLoader";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../ui/input-group";
import { OrganizationError } from "./Error";

export default function OrganizationGeneral({ slug }: { slug: string }) {
    const organization = useQuery(api.myFunctions.getVisibleOrganizationBySlug, { slug });

    if (organization === undefined) {
        return <OrganizationLoader />;
    }

    if (organization === null) {
        return <OrganizationError error={new Error("Organization not found")} />;
    }

    return <OrganizationGeneralForm organization={organization} />;
}

function OrganizationGeneralForm({
                                     organization,
                                 }: {
    organization: {
        _id: string;
        name: string;
        slug: string;
        pointValue: number;
    };
}) {
    const [isPending, setIsPending] = useState(false);
    const updateOrganization = useMutation(api.myFunctions.updateVisibleOrganization);

    const form = useForm({
        defaultValues: {
            name: organization.name,
            slug: organization.slug,
            pointValue: organization.pointValue,
        },
        onSubmit: async ({ value }) => {
            setIsPending(true);

            try {
                const { slug: currentSlug, ...rest } = value;
                const data = currentSlug === organization.slug ? rest : value;

                await updateOrganization({
                    organizationId: organization._id,
                    data,
                });

                toast.success("Organization updated");
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to update organization"
                );
            } finally {
                setIsPending(false);
            }
        },
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
                        );
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
                        );
                    }}
                />

                <form.Field
                    name="pointValue"
                    validators={{
                        onChange: ({ value }) =>
                            value <= 0 ? { message: "Must be greater than $0.00" } : undefined,
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
                                        onChange={(e) =>
                                            field.handleChange(
                                                e.target.value === "" ? ("" as unknown as number) : parseFloat(e.target.value)
                                            )
                                        }
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
                        );
                    }}
                />

                <FieldGroup>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Spinner /> : "Save"}
                    </Button>
                </FieldGroup>
            </FieldGroup>
        </form>
    );
}