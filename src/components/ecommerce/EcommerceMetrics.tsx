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

export const EcommerceMetrics = () => {
  const cryptos = [
    {
      name: "ETH",
      fullName: "Eth, Inc.",
      price: "$1,232.00",
      change: 11.01,
      logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024", // Replace with your local icon if needed
    },
    {
      name: "Bitcoin",
      fullName: "Bitcoin, Inc.",
      price: "$965.00",
      change: -9.05,
      logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024",
    },
    {
      name: "Solana",
      fullName: "Solana, Inc.",
      price: "$1,232.00",
      change: 11.01,
      logo: "https://cryptologos.cc/logos/solana-sol-logo.png?v=024",
    },
    {
      name: "BNB",
      fullName: "BNB, Inc.",
      price: "$2,567.00",
      change: 11.01,
      logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=024",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cryptos.map((crypto) => (
        <div
          key={crypto.name}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-md"
        >
          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <img
                src={crypto.logo}
                alt={crypto.name}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {crypto.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {crypto.fullName}
              </p>
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