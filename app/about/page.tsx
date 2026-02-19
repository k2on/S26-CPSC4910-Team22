"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

const DAYS = 1000 * 60 * 60 * 24;

export default function Page() {
  const result = useQuery(api.services.myFunctions.getAbout);

  if (result == undefined) return <main>Loading...</main>

  if (!result.about) return <main>No data :(</main>

  const { team, version, releaseDate, productName, productDescription } = result.about;

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="py-4">
        <h1 className="text-3xl">About Page</h1>
      </div>
      <div>
        <table>
          <tbody>
            <tr>
              <td><b>Team #</b></td><td>{team}</td>
            </tr>
            <tr>
              <td><b>      Version #</b></td><td>{version}</td>
            </tr>
            <tr>
              <td><b>      Release Date</b></td><td>{new Date(releaseDate * 1000 + (7 * DAYS)).toLocaleString()}</td>
            </tr>
            <tr>
              <td><b>      Product Name</b></td><td>{productName}</td>
            </tr>
            <tr>
              <td><b>      Product Description</b></td><td>{productDescription}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  )
}
