"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
        Combobox,
        ComboboxContent,
        ComboboxEmpty,
        ComboboxInput,
        ComboboxItem,
        ComboboxList,
} from "../ui/combobox"

const frameworks = [
        "My Org",
        "Another",
] as const

export function Applications() {
        const data = useQuery(api.myFunctions.getDriverApplications);

        // return JSON.stringify(data);

        return (
                <>
                        <Card>
                                <CardHeader>
                                        <CardTitle>Driver Applications</CardTitle>
                                </CardHeader>
                                <CardContent>
                                        <Combobox items={frameworks}>
                                                <ComboboxInput placeholder="Select a framework" />
                                                <ComboboxContent>
                                                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                                                        <ComboboxList>
                                                                {(item) => (
                                                                        <ComboboxItem key={item} value={item}>
                                                                                {item}
                                                                        </ComboboxItem>
                                                                )}
                                                        </ComboboxList>
                                                </ComboboxContent>
                                        </Combobox>
                                </CardContent>
                        </Card>

                        {data?.map(app => <Card key={app._id}>
                                <CardHeader>
                                        <CardTitle>{app.orgId}, Status: {app.status}</CardTitle>
                                </CardHeader>
                        </Card>
                        )}
                </>
        );
}
