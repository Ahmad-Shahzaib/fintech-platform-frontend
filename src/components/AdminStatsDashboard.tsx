// components/AdminStatsDashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchFinancialSummary } from '@/redux/thunk/financialSummaryThunks';

interface Stats {
  totalRevenue: number;
  transactionVolume: number;
  numberOfTransactions: number;
  outstandingRepayments: number;
  latePaymentsCount: number;
  lateFeesCollected: number;
}

const AdminStatsDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: financialData, loading } = useAppSelector(state => state.financialSummary);

  const [dateRange, setDateRange] = useState<'thisMonth' | 'lastMonth' | 'custom'>('thisMonth');

  // Fetch financial summary on mount and when date range changes
  useEffect(() => {
    dispatch(fetchFinancialSummary({}));
  }, [dispatch]);

  const getDateRangeLabel = () => {
    if (!financialData?.period) return 'Loading...';
    
    const startDate = new Date(financialData.period.start);
    const endDate = new Date(financialData.period.end);
    
    if (dateRange === 'custom') {
      return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
    }
    return format(startDate, 'MMMM yyyy');
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' && value >= 1000
              ? `$${value.toLocaleString()}`
              : value}
          </p>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Financial Overview
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Key metrics and performance summary
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>

            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getDateRangeLabel()}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-gray-500">Loading financial data...</span>
            </div>
          </div>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              subtitle="Platform + Network Fees"
              value={financialData?.revenue ? parseFloat(financialData.revenue.total_revenue) : 0}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              color="bg-green-600"
            />

            <StatCard
              title="Total Lent"
              subtitle="Total value processed"
              value={financialData?.lending ? parseFloat(financialData.lending.total_lent) : 0}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              color="bg-blue-600"
            />

            <StatCard
              title="Number of Transactions"
              subtitle="Total lending transactions"
              value={financialData?.lending?.transaction_count ?? 0}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="bg-indigo-600"
            />

            <StatCard
              title="Outstanding Repayments"
              subtitle="Total pending & partial"
              value={financialData?.outstanding ? parseFloat(financialData.outstanding.total_outstanding) : 0}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-orange-600"
            />

            <StatCard
              title="Late Payments"
              subtitle="Overdue count"
              value={financialData?.late_payments?.count ?? 0}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              color="bg-red-600"
            />

            <StatCard
              title="On-Time Payment Rate"
              subtitle="Performance metric"
              value={`${financialData?.performance?.on_time_payment_rate?.toFixed(1) ?? 0}%`}
              icon={
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-purple-600"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminStatsDashboard;