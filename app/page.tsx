"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { Separator } from "@radix-ui/react-separator";

function ApplyButton(){
  const { data, isPending } = authClient.useSession();
  if(data?.user.role === "driver"){
    return (
      <div className="max-w-lg mx-auto flex flex-col">
        <Button asChild>
          <Link href="/application">Apply to a Sponsor Organization</Link>
        </Button>
      </div>
      );
  }
}

export default function Home() {
  const { data, isPending } = authClient.useSession();

  return (
    <main className="max-w-lg mx-auto">
      {isPending ? "Loading" : data == null ? <>
        You are not signed in
        <Separator />

        <div className="flex flex-col">
          <Button asChild variant="outline">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>

      </> : <>
        You are signed in as {data.user.name} ({data.user.email})

        <div className="flex flex-col space-y-1"> 
          <Separator />
          <Button asChild>
            <Link href="/editprofile">Edit Profile</Link>
          </Button>
          <Separator />
        </div>

        {/* <div className="flex flex-col space-y-1">
          <Separator />
          <Button asChild>
            <Link href="/application">Apply to a Sponsor Organization</Link>
          </Button>
          <Separator />
        </div> */}

      <ApplyButton />
        
        <div className="flex flex-col space-y-1">
          <Separator />
          <Button asChild>
            <Link href="/about">About Page</Link>
          </Button>
          <Separator />
        </div>

        <div className="flex flex-col space-y-1">
          <Separator />
          <Button variant="outline" onClick={() => {
            authClient.signOut();
          }}>Sign Out</Button>
          <Separator />
        </div>
      </>}
    </main>
  );
}
