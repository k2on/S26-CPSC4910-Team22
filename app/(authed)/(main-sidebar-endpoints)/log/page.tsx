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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Page() {
  const organizations = useQuery(api.myFunctions.getVisibleOrganizations);
  const me = useQuery(api.myFunctions.getMe);
  const EVENT_TYPES = (me?.role == "admin") ? 
  [ 
    { value: "pointChange", label: "Point Change" },
    { value: "loginAttempt", label: "Login Attempt" },
    { value: "passwordChange", label: "Password Change" },
    { value: "application", label: "Application" },
  ] : 
  [
    { value: "pointChange", label: "Point Change" },
    { value: "application", label: "Application" },
  ];
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  useEffect(() => {
    if(me && me.role !== "admin" && organizations && organizations.length > 0){
      setSelectedOrg(organizations[0]._id);
    }
  }, [me, organizations]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const data = useQuery(api.myFunctions.getFullOrderedAuditLog, {
    from: date?.from ? startOfDay(date.from).getTime() : undefined,
    to: date?.to ? endOfDay(date.to).getTime() : undefined,
    sponsorId: selectedOrg,
    type: selectedType,
    sortBy: sortBy,
  });

  const downloadCSV = (data: any[]) => {
    if(data.length === 0) return;

    const headers = ["Time", "Event", "Sponsor Org", "User Email", "Enactor Email", "Point Change", "New Total", "Status", "Reason"];
    const csvRows = data.map(log => [
      new Date(log.time).toLocaleString().replace(/,/g, ""),
      log.event,
      log.sponsorName || "--",
      log.email || "--",
      log.enactorEmail || "--",
      log.amount || "0",
      log.pointTotal || "0",
      log.status || "--",
      `"${(log.reason || "").replace(/"/g, '""')}"`,
    ].join(","));

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return(
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-[200px]">
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
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">By Time</SelectItem>
            <SelectItem value="sponsor">By Sponsor</SelectItem>
            <SelectItem value="user">By User</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange date={date} setDate={setDate} />
        <Button
          variant="outline"
          onClick={() => downloadCSV(data || [])}
          disabled={!data || data.length === 0}
        >
          <Download />Download CSV
        </Button>
      </div>
      <div className="pt-4">
        <DataTable columns={columns} data={data || []} />
      </div>
    </div>
  );
}
