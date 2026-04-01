import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { fetchAuthQuery } from "@/lib/auth-server";

export default async function LandingPage() {
  await fetchAuthQuery(api.myFunctions.getMe);
  redirect("/home");
}