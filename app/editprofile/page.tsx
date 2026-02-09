"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Page() {
    const { data, isPending } = authClient.useSession();
    const [email, setEmail] = useState("");

    const changeEmail = () => {
        authClient.changeEmail({
            newEmail: email,
            callbackURL: "/"
        })
    }

    return (
    <main>
      <div className="flex flex-col">
        EDIT PROFILE
        <div className="flex flex-col"> 
            <Link href="/">Back</Link>
        </div>
      </div>
      <div>Account Name:</div>
      <div>Account Email:</div>
      <div className="flex flex-col">
        <input placeholder={data?.user.email} type="email" onChange={(e) => setEmail(e.target.value)} />
        <button style={{textAlign:"left"}} onClick={changeEmail}>Update Email</button>
        </div>
    </main>
  );
}