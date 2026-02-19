"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Separator } from "@radix-ui/react-separator";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

const organizations = [
 "Drivers United",
 "Trucker Nation",
 "Drive Drive Drive",
 "I Love Trucking",
 "Truckers R Us"
] as const


export default function Page() {
    const { data, isPending } = authClient.useSession();

    return (
        <main className="max-w-lg mx-auto">
            <div className="flex flex-col">
                <label className="block text-3xl font-semibold text-center mb-4">
                Apply to a Sponsor Organization
                </label>
                <Separator />
                <Button asChild variant="outline">
                    <Link href="/">Back</Link>
                </Button>
                <Separator />
            </div>
            <div className="flex flex-col space-y-1">
                <Separator />
                <Combobox items={organizations}>
                    <ComboboxInput placeholder="Select an organization" />
                    <ComboboxContent> 
                        <ComboboxEmpty>No organizations found</ComboboxEmpty>
                        <ComboboxList>
                            {(item) => (
                                <ComboboxItem key={item} value={item}>
                                    {item}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
            </div>
            <div className="flex flex-col space-y-1">
                <Separator />
                <Button>Apply</Button>
            </div>
        </main>
    );
}