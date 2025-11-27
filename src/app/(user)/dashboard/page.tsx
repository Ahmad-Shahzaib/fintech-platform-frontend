"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useAuth } from "@/context/AuthContext";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Welcome{user?.name ? `, ${user.name}` : ''}!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Here is your dashboard overview.</p>
        </div>
        <PageBreadCrumb pageTitle="" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-6">
       
         <div className="grid grid-cols-12 gap-4 md:gap-6">
             <div className="col-span-12">
                     <EcommerceMetrics />
                   </div>
             
                   {/* Other components can have their own col-span */}
                   {/* <div className="col-span-12 xl:col-span-7">
                     <MonthlySalesChart />
                   </div> */}
             
                   {/* <div className="col-span-12 xl:col-span-5">
                     <MonthlyTarget />
                   </div> */}
        
              {/* <div className="col-span-12">
                <StatisticsChart />
              </div> */}
        
              {/* <div className="col-span-12 xl:col-span-5">
                <DemographicCard />
              </div> */}
        
              <div className="col-span-12 xl:col-span-12">
                <RecentOrders />
              </div>
            </div>
      </div>
    </>
  );
}
