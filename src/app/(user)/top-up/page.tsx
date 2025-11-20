// import Calendar from "@/components/top-up/TopUpRequest";
import TopUpRequest from "@/components/top-up/TopUpRequest";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import TopUpsDashboard from "@/components/top-up/TopUpsDashboard ";


export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="TopUp" />
      {/* <Calendar /> */}
      <TopUpRequest />
      <TopUpsDashboard />
    </div>
  );
}
