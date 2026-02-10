"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Page() {
    const { data, isPending } = authClient.useSession();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const changeEmail = () => {
        authClient.changeEmail({
            newEmail: email,
            callbackURL: "/"
        })
    }

    const changeName = () => {
        authClient.updateUser({
            name: name
        })
    }

    return (
    <main className="max-w-lg mx-auto">
      <div className="flex flex-col">
        EDIT PROFILE
        <Separator />
        <div className="flex flex-col"> 
            <Button asChild variant="outline">
              <Link href="/">Back</Link>
            </Button>
        </div>
      </div>
      <div>Account Name:</div>
      <div className="flex flex-row">
        <Input placeholder={data?.user.name} type="name" onChange={(e) => setName(e.target.value)} />
        <Button onClick={changeName}>Update Name</Button>
      </div>
      <div>Account Email:</div>
      <div className="flex flex-row">
        <Input placeholder={data?.user.email} type="email" onChange={(e) => setEmail(e.target.value)} />
        <Button style={{textAlign:"left"}} onClick={changeEmail}>Update Email</Button>
      </div>
    </main>
  );
}