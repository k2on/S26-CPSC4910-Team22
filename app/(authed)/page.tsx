import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";

export default async function Home() {
  const result = await fetchAuthQuery(api.myFunctions.getMe)
  if (result?.role == "admin") return <div>You are an admin</div>
  if (result?.role == "sponsor") return <div>You are a sponsor</div>

  return (
    <main className="max-w-lg mx-auto">
      You are a driver
    </main>
  );
}
