import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { Applications } from "@/components/driver/Applications";
import { VisibleOrganizations } from "@/components/VisibleOrganizations";

export default async function Home() {
  const me = await fetchAuthQuery(api.myFunctions.getMe)

  return (
    <div className="pt-4 w-2xl mx-auto">

      {me?.role != "admin" && <VisibleOrganizations />}

      {me?.role == "driver" && <Applications />}

    </div>
  );
}
