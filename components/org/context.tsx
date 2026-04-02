"use client";
import { createContext, useContext } from "react";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

type Org = FunctionReturnType<typeof api.myFunctions.getOrg>;
const OrgContext = createContext<Org | null>(null);
export const useOrg = () => useContext(OrgContext)!;
export function OrgProvider({ org, children }: { org: Org; children: React.ReactNode }) {
  return <OrgContext.Provider value={org}>{children}</OrgContext.Provider>;
}
