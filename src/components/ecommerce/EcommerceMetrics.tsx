"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons"; // Assuming you have these

// Simple badge component (you can replace with your existing Badge if preferred)
const ChangeBadge = ({ value }: { value: number }) => {
  const isPositive = value > 0;
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isPositive
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {isPositive ? (
        <ArrowUpIcon className="w-3 h-3" />
      ) : (
        <ArrowDownIcon className="w-3 h-3" />
      )}
      {Math.abs(value).toFixed(2)}%
    </div>
  );
};

// Icon mapping based on name
const getIcon = (name: string) => {
  switch (name) {
    case "Total Topup Amount":
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Total Repayments":
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "Topup Requests":
      return (
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "kyc Status":
      return (
        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

export const EcommerceMetrics = () => {
  const cryptos = [
    {
      name: "Total Topup Amount",
      price: "$1,232.00",
      change: 11.01,
    },
    {
      name: "Total Repayments",
      price: "$965.00",
      change: -9.05,
    },
    {
      name: "Topup Requests",
      price: "$1,232.00",
      change: 11.01,
    },
    {
      name: "kyc Status",
      price: "Approved",
      change: 11.01,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cryptos.map((crypto) => (
        <div
          key={crypto.name}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-md"
        >
          {/* Icon + Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              {getIcon(crypto.name)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {crypto.name}
              </h3>
            </div>
          </div>

          {/* Price + Change */}
          <div className="flex items-end justify-between mt-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {crypto.price}
              </h4>
            </div>
            <ChangeBadge value={crypto.change} />
          </div>
        </div>
      ))}
    </div>
  );
};