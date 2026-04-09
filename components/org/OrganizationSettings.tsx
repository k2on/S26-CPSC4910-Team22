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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function OrganizationSettings({ slug }: { slug: string }) {
    const organization = useQuery(api.myFunctions.getVisibleOrganizationBySlug, { slug });
    const catalogSettings = useQuery(api.myFunctions.getCatalogSettings, organization ? { organizationId: organization._id } : "skip");

    if (organization === undefined || catalogSettings === undefined) {
        return <OrganizationLoader />;
    }

    if (organization === null) {
        return <OrganizationError error={new Error("Organization not found")} />;
    }

    const loadedSettings = catalogSettings ?? {
        organizationId: organization._id,
        hasMusic: true,
        hasMusicVideos: true,
        hasAudiobooks: true,
        hasShows: true,
    };

    return <OrganizationSettingsForm organization={organization} catalogSettings={loadedSettings} />;
}

function OrganizationSettingsForm({
                                     organization,
                                     catalogSettings,
                                 }: {
    organization: {
        _id: string;
        name: string;
        slug: string;
        pointValue: number;
    };
    catalogSettings: {
        organizationId: string;
        hasMusic: boolean;
        hasMusicVideos: boolean;
        hasAudiobooks: boolean;
        hasShows: boolean;
    };
}) {
    const [isPending, setIsPending] = useState(false);
    const updateOrganization = useMutation(api.myFunctions.updateVisibleOrganization);
    const updateCatalogSettings = useMutation(api.myFunctions.updateCatalogSettings);

    const form = useForm({
        defaultValues: {
            name: organization.name,
            slug: organization.slug,
            pointValue: organization.pointValue,
            catalogSettings: {
                hasMusic: catalogSettings?.hasMusic ?? true,
                hasMusicVideos: catalogSettings?.hasMusicVideos ?? true,
                hasAudiobooks: catalogSettings?.hasAudiobooks ?? true,
                hasShows: catalogSettings?.hasShows ?? true,
            }
        },
        onSubmit: async ({ value }) => {
            setIsPending(true);

            try {
                const { name, slug, pointValue, catalogSettings } = value;

                await updateOrganization({
                    organizationId: organization._id,
                    data: {
                        name, 
                        pointValue,
                        ...(slug !== organization.slug && { slug })
                    }
                });
                await updateCatalogSettings({
                    organizationId: organization._id,
                    ...catalogSettings,
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

                <div className="text-lg">Available media types in catalog:</div>
                <form.Field
                    name="catalogSettings.hasMusic"
                    children={(field) => (
                        <Field className="flex flex-row items-center ml-5">
                            <div className="flex w-4 h-4 shrink-0 items-center">
                                <Checkbox
                                    id={field.name}
                                    checked={field.state.value}
                                    onCheckedChange={(checked: boolean | "indeterminate") => field.handleChange(!!checked)}
                                    disabled={isPending}
                                />
                                <div className="flex flex-row px-2"><FieldLabel htmlFor={field.name}>Music</FieldLabel></div>
                            </div>
                        </Field>
                    )}
                />
                <form.Field
                    name="catalogSettings.hasMusicVideos"
                    children={(field) => (
                        <Field className="flex flex-row items-center ml-5">
                            <div className="flex w-4 h-4 shrink-0 items-center">
                                <Checkbox
                                    id={field.name}
                                    checked={field.state.value}
                                    onCheckedChange={(checked: boolean | "indeterminate") => field.handleChange(!!checked)}
                                    disabled={isPending}
                                />
                                <div className="flex flex-row px-2"><FieldLabel htmlFor={field.name}>Music Videos</FieldLabel></div>
                            </div>
                        </Field>
                    )}
                />
                <form.Field
                    name="catalogSettings.hasAudiobooks"
                    children={(field) => (
                        <Field className="flex flex-row items-center ml-5">
                            <div className="flex w-4 h-4 shrink-0 items-center">
                                <Checkbox
                                    id={field.name}
                                    checked={field.state.value}
                                    onCheckedChange={(checked: boolean | "indeterminate") => field.handleChange(!!checked)}
                                    disabled={isPending}
                                />
                                <div className="flex flex-row px-2"><FieldLabel htmlFor={field.name}>Audiobooks</FieldLabel></div>
                            </div>
                        </Field>
                    )}
                />
                <form.Field
                    name="catalogSettings.hasShows"
                    children={(field) => (
                        <Field className="flex flex-row items-center ml-5">
                            <div className="flex w-4 h-4 shrink-0 items-center">
                                <Checkbox
                                    id={field.name}
                                    checked={field.state.value}
                                    onCheckedChange={(checked: boolean | "indeterminate") => field.handleChange(!!checked)}
                                    disabled={isPending}
                                />
                                <div className="flex flex-row px-2"><FieldLabel htmlFor={field.name}>TV Shows</FieldLabel></div>
                            </div>
                        </Field>
                    )}
                />

                <Separator />
                <FieldGroup>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Spinner /> : "Save"}
                    </Button>
                </FieldGroup>
            </FieldGroup>
        </form>
    );
}