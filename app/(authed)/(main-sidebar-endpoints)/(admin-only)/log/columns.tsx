"use client"

import { Doc } from "@/convex/_generated/dataModel"
import { ColumnDef } from "@tanstack/react-table"
import { api } from "@/convex/_generated/api"

export const fixEventTitle = (title: string) => {
    switch(title){
      case "pointChange":
        return "Point Change";
      case "passwordChange":
        return "Password Change";
      case "application":
        return "Application";
      case "loginAttempt":
        return "Login Attempt";
      default:
        return "Unknown Event";
    };
}

export const columns: ColumnDef<Doc<"auditLog">>[] = [
  {
    accessorKey: "time",
    header: "Date, Time",
    cell: ({ row }) => {
      const time = row.getValue("time") as number;
      return new Date(time).toLocaleString();
    }
  },
  {
    accessorKey: "event",
    header: "Event",
    cell: ({ row }) => {
      const event = row.getValue("event") as string;
      return fixEventTitle(event);
    }
  },
  {
    accessorKey: "sponsor",
    header: "Sponsor",
    cell: ({ row }) => {
      const sponsorName = row.getValue("sponsor") as string//TODO: get org name by id (looks better, rubric says username so probably required)
      return sponsorName || "--";
    }
  },
  {
    accessorKey: "user",
    header: "User ID",
  },
  {
    accessorKey: "email",
    header: "User Email",
    cell: ({ row }) => {
      const userEmail = row.getValue("email") as string
      return userEmail || "--";//TODO: store user email for other events (not part of rubric but looks better)
    }
  },
  {
    accessorKey: "amount",
    header: "Point Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as string
      return amount || "--";
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return status || "--";
    }
  },{
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string
      return reason || "--";
    }
  },
]
