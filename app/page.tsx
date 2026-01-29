"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export default function Home() {
  const result = useQuery(api.myFunctions.getNumbers);
  const add = useMutation(api.myFunctions.addNumber);

  return (
    <main>
      <button className="bg-white text-black" onClick={() => {
        add({ number: 64 });
      }}>Add</button>

      Result: {JSON.stringify(result?.numbers.map(n => n.number).join(", "))}

    </main>
  );
}
