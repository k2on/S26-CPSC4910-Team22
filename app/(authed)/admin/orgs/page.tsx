"use client";

import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { CreateOrganizationModel } from "./CreateOrganizationModel";

export default function Page() {
  const { data } = useQuery({
    queryKey: ["orgs"],
    queryFn: () => authClient.organization.list()
  });

  return (
    <div>
      <CreateOrganizationModel />

    </div>
  );
}
