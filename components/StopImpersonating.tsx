"use client";

import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function StopImpersonating() {
        const { mutate: stopImpersonating } = useMutation({
                mutationFn: async (input: Parameters<typeof authClient.admin.stopImpersonating>[0]) => authClient.admin.stopImpersonating(input),
                onSuccess: () => {
                        window.location.href = "/";
                }
        });

        return (
                <Button variant="outline" onClick={() => stopImpersonating({})}>Stop Impersonating</Button>
        );
} 
