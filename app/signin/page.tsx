"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

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
    <main>
      <div className="flex flex-col">
        <input placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={onSubmit}>Sign In</button>
      </div>
    </main>
  );
}
