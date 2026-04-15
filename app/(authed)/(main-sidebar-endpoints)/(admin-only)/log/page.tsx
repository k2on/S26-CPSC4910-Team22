"use client";

import { useState } from "react";
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

const EVENT_TYPES = [
  { value: "pointChange", label: "Point Change" },
  { value: "loginAttempt", label: "Login Attempt" },
  { value: "passwordChange", label: "Password Change" },
  { value: "application", label: "Application" },
];

export default function Page() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const data = useQuery(api.myFunctions.getFullOrderedAuditLog, {
    from: date?.from ? startOfDay(date.from).getTime() : undefined,
    to: date?.to ? endOfDay(date.to).getTime() : undefined,
    sponsorId: selectedOrg,
    type: selectedType,
  });
  const organizations = useQuery(api.myFunctions.getVisibleOrganizations);

  return(
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations?.map((org) => (
              <SelectItem key={org._id} value={org._id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>
      <div className="pt-4">
        <DataTable columns={columns} data={data || []} />
      </div>
    </div>
  );
}
