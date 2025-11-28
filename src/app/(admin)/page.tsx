import type { Metadata } from "next";
import KycMetricsClient from '@/components/ecommerce/KycMetricsClient';
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title:
    " Topify Dashboard | Topify  Dashboard ",
  description: "This is Topify Home for ",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <KycMetricsClient />
      </div>

      {/* Other components can have their own col-span */}
      {/* <div className="col-span-12 xl:col-span-7">
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      */}
       <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
