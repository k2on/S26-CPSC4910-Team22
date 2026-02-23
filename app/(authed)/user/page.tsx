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

export default function Page() {
  const { data } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      name: data?.user.name || '',
      address: data?.user.address || '',
    },
    onSubmit: async ({ value }) => {
      mutate(value)
    },
  });


  const { isPending, mutate } = useMutation({
    mutationFn: async (input: Parameters<typeof authClient.updateUser>[0]) => authClient.updateUser(input),
    onSuccess: () => {
      toast.success("Profile updated");
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
        {isPending ? <Spinner /> : "Save"}
      </Button>
    </form>
  )
}
