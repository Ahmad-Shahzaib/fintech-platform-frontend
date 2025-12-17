"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; 

interface Transaction {
  id: string;
  transactionId: string;
  date: string;
  userName: string;
  currency: string;
  network: string;
  amountAud: number;  
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
}

const mockData: Transaction[] = [
  { id: '1', transactionId: 'TXN-20251217-001', date: '2025-12-17', userName: 'John Doe', currency: 'USDT', network: 'TRC20', amountAud: 1500, status: 'pending' },
  { id: '2', transactionId: 'TXN-20251216-045', date: '2025-12-16', userName: 'Alice Smith', currency: 'BTC', network: 'Bitcoin', amountAud: 3200, status: 'approved' },
  { id: '3', transactionId: 'TXN-20251215-112', date: '2025-12-15', userName: 'Michael Chen', currency: 'ETH', network: 'ERC20', amountAud: 890, status: 'processing' },
  { id: '4', transactionId: 'TXN-20251214-078', date: '2025-12-14', userName: 'Sarah Wilson', currency: 'USDC', network: 'Polygon', amountAud: 2100, status: 'completed' },
  { id: '5', transactionId: 'TXN-20251213-203', date: '2025-12-13', userName: 'David Brown', currency: 'USDT', network: 'ERC20', amountAud: 500, status: 'rejected' },
  { id: '6', transactionId: 'TXN-20251212-156', date: '2025-12-12', userName: 'Emma Taylor', currency: 'BTC', network: 'Bitcoin', amountAud: 4500, status: 'completed' },
  { id: '7', transactionId: 'TXN-20251210-089', date: '2025-12-10', userName: 'Liam Johnson', currency: 'USDT', network: 'TRC20', amountAud: 1200, status: 'pending' },
  { id: '8', transactionId: 'TXN-20251209-321', date: '2025-12-09', userName: 'Olivia Martinez', currency: 'ETH', network: 'ERC20', amountAud: 1800, status: 'pending' },
  { id: '9', transactionId: 'TXN-20251208-456', date: '2025-12-08', userName: 'Noah Lee', currency: 'USDT', network: 'TRC20', amountAud: 3000, status: 'completed' },
  { id: '10', transactionId: 'TXN-20251207-789', date: '2025-12-07', userName: 'Sophia Garcia', currency: 'BTC', network: 'Bitcoin', amountAud: 5500, status: 'approved' },
  { id: '11', transactionId: 'TXN-20251206-234', date: '2025-12-06', userName: 'James Wilson', currency: 'USDC', network: 'Polygon', amountAud: 950, status: 'rejected' },
  { id: '12', transactionId: 'TXN-20251205-567', date: '2025-12-05', userName: 'Isabella Moore', currency: 'USDT', network: 'ERC20', amountAud: 2200, status: 'processing' },
];

const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  const variants: Record<Transaction['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${variants[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};

const AllTransactionsTable: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 8;

  // Format display value
  const dateRangeDisplay = selectedRange.from && selectedRange.to
    ? `${format(selectedRange.from, 'yyyy-MM-dd')} to ${format(selectedRange.to, 'yyyy-MM-dd')}`
    : '';

  // Filtering
  const filteredData = mockData.filter((txn) => {
    if (statusFilter && txn.status !== statusFilter) return false;

    if (selectedRange.from && selectedRange.to) {
      const txnDate = parseISO(txn.date);
      const start = startOfDay(selectedRange.from);
      const end = endOfDay(selectedRange.to);
      if (txnDate < start || txnDate > end) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, selectedRange]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const ActionDropdown = ({ txn }: { txn: Transaction }) => (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(txn.id);
        }}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span className="text-2xl leading-none text-gray-600 dark:text-gray-300">⋯</span>
      </button>

      {openDropdownId === txn.id && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                alert(`View: ${txn.transactionId}`);
                setOpenDropdownId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              View
            </button>
            <button
              onClick={() => {
                alert(`Approve: ${txn.transactionId}`);
                setOpenDropdownId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Approve
            </button>
            <button
              onClick={() => {
                alert(`Reject: ${txn.transactionId}`);
                setOpenDropdownId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              All Transactions
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View all top-up and transaction history
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range Picker Trigger */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full px-4 py-2.5 pl-10 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {dateRangeDisplay || 'Select date range'}
              </button>
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>

              {/* Date Picker Modal */}
              {showDatePicker && (
                <div className="absolute right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                  <DayPicker
                    mode="range"
                    selected={{ from: selectedRange.from, to: selectedRange.to }}
                    onSelect={(range: DateRange | undefined) => {
                      setSelectedRange({ from: range?.from, to: range?.to });
                    }}
                    classNames={{
                      day_selected: 'bg-blue-600 text-white hover:bg-blue-700',
                      day_range_start: 'bg-blue-600 text-white rounded-l-full',
                      day_range_end: 'bg-blue-600 text-white rounded-r-full',
                      day_range_middle: 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200',
                    }}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setSelectedRange({ from: undefined, to: undefined });
                        setShowDatePicker(false);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rest of your table remains 100% unchanged */}
      {/* Desktop Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Currency</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Network</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Amount (AUD)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{txn.transactionId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{format(parseISO(txn.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{txn.userName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {txn.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{txn.network}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">${txn.amountAud.toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={txn.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <ActionDropdown txn={txn} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} transactions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((txn) => (
          <div key={txn.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{txn.transactionId}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={txn.status} />
                <ActionDropdown txn={txn} />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{format(parseISO(txn.date), 'MMM dd, yyyy')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">User</span><span className="font-medium">{txn.userName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-lg font-bold">${txn.amountAud.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Crypto</span><span className="font-medium">{txn.currency} ({txn.network})</span></div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTransactionsTable;