"use client";

import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";

export default function Home() {
  const { data, isPending } = authClient.useSession();

  const numbers = useQuery(api.myFunctions.getNumbers)
  const addNumber = useMutation(api.myFunctions.addNumber)

  function onClickMe(){
    addNumber({number:46})
  }

  return (
    <main>
      {isPending ? "Loading" : data == null ? <>
        You are not signed in

        <div className="flex flex-col">
          <Link href="/signup">Sign Up</Link>
          <Link href="/signin">Sign In</Link>
        </div>

      </> : <>
        You are signed in as {data.user.name} ({data.user.email})

        <div className="flex flex-col"> 
          <Link href="/editprofile">Edit Profile</Link>
        </div>

        <div>
          <button onClick={() => {
            authClient.signOut();
          }}>Sign Out</button>
        </div>
      </>}
    </main>
  );
}
