// import Calendar from "@/components/top-up/TopUpRequest";
import TopUpRequest from "@/components/top-up/TopUpRequest";
import { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
  title: "Topify Management System",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      <TopUpRequest />
    </div>
  );
}
