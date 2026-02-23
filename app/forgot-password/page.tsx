"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
    },
    onSubmit: async ({ value }) => {
      mutate(value)
    },
  });


  const { isPending, mutate, isSuccess } = useMutation({
    mutationFn: async (input: Parameters<typeof authClient.requestPasswordReset>[0]) => authClient.requestPasswordReset(input),
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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">

          <Card>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email to send a password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>


              {isSuccess ? (
                <div>
                  The email was successfully sent.
                </div>

              ) : (
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

                    <FieldGroup>
                      <Field>
                        <Button type="submit" className="mt-4" disabled={isPending}>
                          {isPending ? <Spinner /> : "Send Reset Link"}
                        </Button>
                      </Field>
                    </FieldGroup>
                  </FieldGroup>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
