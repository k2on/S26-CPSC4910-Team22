"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");

  return (
    <main className="max-w-lg mx-auto">
      <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <Button onClick={() => {
        authClient.requestPasswordReset({ email });
      }}>Send Reset Link</Button>
    </main>
  )
}
