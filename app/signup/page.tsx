"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSubmit = () => {
    authClient.signUp.email({
      name,
      email,
      password,
    }).then((r) => {
      if (r.error == null)
        router.push("/")
    })
  }

  return (
    <main className="max-w-lg mx-auto">
      <div className="flex flex-col">
        <Input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

        <Button onClick={onSubmit}>Sign Up</Button>
        <Button asChild variant="outline">
          <Link href="/signin">Already Have an Account? Sign In</Link>
        </Button>
      </div>
    </main>
  );
}

