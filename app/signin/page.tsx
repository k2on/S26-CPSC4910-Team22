"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    authClient.signIn.email({
      email,
      password,
      callbackURL: "/"
    })
  }

  return (
    <main className="max-w-lg mx-auto">
      <div className="flex flex-col">
        <Input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

        <Button onClick={onSubmit}>Sign In</Button>
        <Button asChild variant="outline">
          <Link href="/signup">Don't Have an Account? Sign Up</Link>
        </Button>
      </div>
    </main>
  );
}
