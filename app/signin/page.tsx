"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BetterFetchError } from "better-auth/client";
import { parseFieldErrors } from "@/utils/parseFieldErrors";
import { useForm } from "@tanstack/react-form";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      mutate(value)
    },
  });


  const { isPending, mutate, error } = useMutation({
    mutationFn: async (input: Parameters<typeof authClient.signIn.email>[0]) => authClient.signIn.email(input),
    onSuccess: () => {
      router.push("/");
    },
    onError: (error: BetterFetchError) => {
      switch (error.error.code) {
        case "VALIDATION_ERROR":
          form.setErrorMap({
            onSubmit: {
              fields: parseFieldErrors(error.error.message)
            }
          })
          break;
        case "INVALID_EMAIL":
          form.setErrorMap({
            onSubmit: {
              fields: {
                email: { message: error.error.message }
              }
            }
          })
          break;
        case "INVALID_EMAIL_OR_PASSWORD":
          form.setErrorMap({
            onSubmit: {
              form: error.error.message,
              fields: {}
            }
          })
          break;

      }
    }

  })

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">


          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>

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
                            required
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

                  {error && <FieldError errors={[error.error]} />}

                  <FieldGroup>
                    <Field>
                      <Button type="submit" className="mt-4" disabled={isPending}>
                        {isPending ? <Spinner /> : "Sign In"}
                      </Button>
                      <FieldDescription className="px-6 text-center">
                        Don't have an account? <Link href="/signup">Sign up</Link>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
