import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";
import { Applications } from "@/components/driver/Applications";
import { OrganizationSelectionChart } from "@/components/home/OrganizationSelectionChart";

export default async function Home() {
  const me = await fetchAuthQuery(api.myFunctions.getMe)

  return (
    <div className="pt-4 w-2xl mx-auto">

      {me?.role != "admin" && <OrganizationSelectionChart />}

      {me?.role == "driver" && <Applications />}

    </div>
  );
}
