"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { authClient } from "@/lib/auth-client";

export function VisibleOrganizations() {
  const { data: orgs } = authClient.useListOrganizations();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>Organizations you are a part of.</CardDescription>
        </CardHeader>
      </Card>
      <div className="py-4 flex flex-col gap-4">
        {orgs?.map(org => (
          <Link href={`/${org.slug}`} key={org.id}>
            <Card>
              <CardHeader>
                <CardTitle>{org.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );

}
