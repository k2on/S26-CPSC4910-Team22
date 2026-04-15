"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "convex/react";
import { DateRange } from "react-day-picker";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { DatePickerWithRange } from "@/components/logs/date-picker-with-range";

export default function Page() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const data = useQuery(api.myFunctions.getFullOrderedAuditLog, {
    from: date?.from ? startOfDay(date.from).getTime() : undefined,
    to: date?.to ? endOfDay(date.to).getTime() : undefined,
  });

  return(
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>
      <div className="pt-4">
        <DataTable columns={columns} data={data || []} />
      </div>
    </div>
  );
}
