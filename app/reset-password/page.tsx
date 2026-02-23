"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function Page() {
  return (
    <main className="max-w-lg mx-auto">
      <Input placeholder="New Password" type="password" />
      <Button onClick={() => { }}>Change</Button>
    </main>
  )
}
