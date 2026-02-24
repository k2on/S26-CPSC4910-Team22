"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { BetterFetchError } from "better-auth/client";
import { PlusIcon } from "lucide-react";

export function CreateOrganizationModel() {

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
      pointValue: 0.01
    },
    onSubmit: async ({ value }) => {
      mutate(value)
    },
  });


  const { isPending, mutate } = useMutation({
    mutationFn: async (input: Parameters<typeof authClient.organization.create>[0]) => authClient.organization.create(input),
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
      <form>
        <DialogTrigger asChild>
          <Button><PlusIcon /> Create Organization</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Enter the information for a sponsorship organization.</DialogDescription>
          </DialogHeader>
          <FieldGroup>

          </FieldGroup>
        </DialogContent>
      </form>
    </Dialog >
  );
}
