"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    }).then(() => {
      router.push("/")
    })
  }

  return (
    <main>
      <div className="flex flex-col">
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={onSubmit}>Sign Up</button>
      </div>
    </main>
  );
}

