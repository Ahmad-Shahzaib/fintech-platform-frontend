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
      <PageBreadCrumb pageTitle="User Dashboard" />
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Welcome Card */}
        <ComponentCard title={`Welcome, ${user?.name}!`}>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              This is your personal dashboard. You have user-level access to the system.
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Your Account Information
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Role:</span> {user?.role}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">User ID:</span> {user?.id}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <ComponentCard title="My Profile">
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">View and edit your profile</p>
            </div>
          </ComponentCard>

          <ComponentCard title="My Activities">
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Track your activities</p>
            </div>
          </ComponentCard>

          <ComponentCard title="Settings">
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Manage preferences</p>
            </div>
          </ComponentCard>
        </div>

        {/* Restrictions Notice */}
        <ComponentCard title="Access Information">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  User Access Level
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You have user-level access. Some administrative features are restricted. 
                  Contact an administrator if you need elevated permissions.
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>
         <div className="grid grid-cols-12 gap-4 md:gap-6">
              <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics />
        
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
        
              <div className="col-span-12 xl:col-span-7">
                <RecentOrders />
              </div>
            </div>
      </div>
    </>
  );
}
