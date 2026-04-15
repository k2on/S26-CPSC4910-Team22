"use client";

import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "convex/react";
import { DateRange } from "react-day-picker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { DatePickerWithRange } from "@/components/logs/date-picker-with-range";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function FeesPage() {
    const me = useQuery(api.myFunctions.getMe);
    const organizations = useQuery(api.myFunctions.getVisibleOrganizations);
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [selectedOrg, setSelectedOrg] = useState<string>("all");
    useEffect(() => {
        if(me && me.role !== "admin" && organizations && organizations.length > 0){
            if(selectedOrg === "all"){
                setSelectedOrg(organizations[0]._id);
            }
        }
    }, [me, organizations, selectedOrg]);

    const data = useQuery(api.myFunctions.getSponsorFees, {
        from: date?.from ? startOfDay(date.from).getTime() : undefined,
        to: date?.to ? endOfDay(date.to).getTime() : undefined,
        organizationId: selectedOrg,
    });

    return(
        <div className="p-8 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Sponsor Fees</h1>
                    <p className="text-muted-foreground text-sm">Track Billing History and Running Balances</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Select Organization" />
                        </SelectTrigger>
                        <SelectContent>
                            {me?.role === "admin" && (
                                <SelectItem value="all">All Organizations</SelectItem>
                            )}
                            {organizations?.map((org) => (
                                <SelectItem key={org._id} value={org._id}>
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DatePickerWithRange date={date} setDate={setDate} />
                </div>
            </div>
            <div className="pt-4">
                <DataTable columns={columns} data={data || []} />
            </div>
        </div>
    );
}