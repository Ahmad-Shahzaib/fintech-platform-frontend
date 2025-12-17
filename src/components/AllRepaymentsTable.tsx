    // components/AllRepaymentsTable.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface Repayment {
  id: string;
  repaymentId: string;
  userName: string;
  transactionId: string;
  amountDue: number;
  status: 'pending' | 'late' | 'paid';
  dueDate: string; // ISO date
}

const mockRepayments: Repayment[] = [
  { id: '1', repaymentId: 'REP-20251201', userName: 'John Doe', transactionId: 'TXN-20251217-001', amountDue: 1200, status: 'pending', dueDate: '2025-12-20' },
  { id: '2', repaymentId: 'REP-20251202', userName: 'Alice Smith', transactionId: 'TXN-20251216-045', amountDue: 850, status: 'late', dueDate: '2025-12-10' },
  { id: '3', repaymentId: 'REP-20251203', userName: 'Michael Chen', transactionId: 'TXN-20251215-112', amountDue: 2000, status: 'paid', dueDate: '2025-12-15' },
  { id: '4', repaymentId: 'REP-20251204', userName: 'Sarah Wilson', transactionId: 'TXN-20251214-078', amountDue: 500, status: 'pending', dueDate: '2025-12-25' },
  { id: '5', repaymentId: 'REP-20251205', userName: 'David Brown', transactionId: 'TXN-20251213-203', amountDue: 1500, status: 'late', dueDate: '2025-12-05' },
  { id: '6', repaymentId: 'REP-20251206', userName: 'Emma Taylor', transactionId: 'TXN-20251212-156', amountDue: 3000, status: 'paid', dueDate: '2025-12-12' },
  { id: '7', repaymentId: 'REP-20251207', userName: 'Liam Johnson', transactionId: 'TXN-20251210-089', amountDue: 950, status: 'pending', dueDate: '2025-12-22' },
  { id: '8', repaymentId: 'REP-20251208', userName: 'Olivia Martinez', transactionId: 'TXN-20251209-321', amountDue: 1800, status: 'late', dueDate: '2025-12-08' },
];

const StatusBadge: React.FC<{ status: Repayment['status'] }> = ({ status }) => {
  const variants: Record<Repayment['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    late: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

const AllRepaymentsTable: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 8;

  // Current date for overdue check
  const today = new Date('2025-12-17');

  // Filtering
  const filteredData = mockRepayments.filter((rep) => {
    if (statusFilter && rep.status !== statusFilter) return false;
    if (overdueOnly) {
      const due = parseISO(rep.dueDate);
      if (!(rep.status !== 'paid' && due < today)) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, overdueOnly]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const ActionDropdown = ({ rep }: { rep: Repayment }) => (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(rep.id);
        }}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span className="text-2xl leading-none text-gray-600 dark:text-gray-300">⋯</span>
      </button>

      {openDropdownId === rep.id && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                alert(`Marked as Paid: ${rep.repaymentId}`);
                setOpenDropdownId(null);
              }}
              disabled={rep.status === 'paid'}
              className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Mark as Paid
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
              All Repayments
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and track user loan repayments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="late">Late</option>
              <option value="paid">Paid</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Overdue Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Repayment ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Amount Due</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((rep) => (
                <tr key={rep.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{rep.repaymentId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{rep.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{rep.transactionId}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${rep.amountDue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {format(parseISO(rep.dueDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={rep.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <ActionDropdown rep={rep} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} repayments
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
        {paginatedData.map((rep) => (
          <div key={rep.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Repayment ID</p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{rep.repaymentId}</p>
                <p className="text-sm font-medium mt-1">{rep.userName}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={rep.status} />
                <ActionDropdown rep={rep} />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction</span>
                <span className="font-medium">{rep.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Due</span>
                <span className="text-lg font-bold">${rep.amountDue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium">{format(parseISO(rep.dueDate), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Pagination */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

export default AllRepaymentsTable;