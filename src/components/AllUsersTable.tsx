// components/AllUsersTable.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface User {
  id: string;
  userId: string;
  name: string;
  email: string;
  kycStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  accountStatus: 'active' | 'suspended' | 'inactive';
  totalSpent: number;
  transactionCount: number;
  registeredDate: string; // ISO date
}

const mockUsers: User[] = [
  { id: '1', userId: 'USR-1001', name: 'John Doe', email: 'john@example.com', kycStatus: 'approved', accountStatus: 'active', totalSpent: 5420, transactionCount: 42, registeredDate: '2025-01-15' },
  { id: '2', userId: 'USR-1002', name: 'Alice Smith', email: 'alice@example.com', kycStatus: 'pending', accountStatus: 'active', totalSpent: 1890, transactionCount: 12, registeredDate: '2025-11-20' },
  { id: '3', userId: 'USR-1003', name: 'Michael Chen', email: 'michael@example.com', kycStatus: 'under_review', accountStatus: 'active', totalSpent: 3200, transactionCount: 28, registeredDate: '2025-10-05' },
  { id: '4', userId: 'USR-1004', name: 'Sarah Wilson', email: 'sarah@example.com', kycStatus: 'rejected', accountStatus: 'suspended', totalSpent: 800, transactionCount: 5, registeredDate: '2025-09-12' },
  { id: '5', userId: 'USR-1005', name: 'David Brown', email: 'david@example.com', kycStatus: 'approved', accountStatus: 'inactive', totalSpent: 12500, transactionCount: 98, registeredDate: '2025-03-22' },
  { id: '6', userId: 'USR-1006', name: 'Emma Taylor', email: 'emma@example.com', kycStatus: 'approved', accountStatus: 'active', totalSpent: 7800, transactionCount: 65, registeredDate: '2025-06-18' },
  { id: '7', userId: 'USR-1007', name: 'Liam Johnson', email: 'liam@example.com', kycStatus: 'pending', accountStatus: 'active', totalSpent: 450, transactionCount: 3, registeredDate: '2025-12-10' },
  { id: '8', userId: 'USR-1008', name: 'Olivia Martinez', email: 'olivia@example.com', kycStatus: 'approved', accountStatus: 'active', totalSpent: 6700, transactionCount: 51, registeredDate: '2025-07-30' },
];

const KYCStatusBadge: React.FC<{ status: User['kycStatus'] }> = ({ status }) => {
  const variants: Record<User['kycStatus'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const label = status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

const AccountStatusBadge: React.FC<{ status: User['accountStatus']; className?: string }> = ({ status, className }) => {
  const variants: Record<User['accountStatus'], string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${variants[status]} ${className ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};

const AllUsersTable: React.FC = () => {
  const [kycFilter, setKycFilter] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 8;

  // Filtering
  const filteredData = mockUsers.filter((user) => {
    if (kycFilter && user.kycStatus !== kycFilter) return false;
    if (accountFilter && user.accountStatus !== accountFilter) return false;
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
  }, [kycFilter, accountFilter]);

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

  const ActionDropdown = ({ user }: { user: User }) => (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(user.id);
        }}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <span className="text-2xl leading-none text-gray-600 dark:text-gray-300">⋯</span>
      </button>

      {openDropdownId === user.id && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                alert(`View profile: ${user.name}`);
                setOpenDropdownId(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              View
            </button>
            <button
              onClick={() => {
                if (confirm(`Suspend ${user.name}?`)) {
                  alert(`User ${user.userId} suspended`);
                }
                setOpenDropdownId(null);
              }}
              disabled={user.accountStatus === 'suspended'}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Suspend
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
              All Users
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and monitor all registered users
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All KYC Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Account Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Account Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Transactions</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{user.userId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4"><KYCStatusBadge status={user.kycStatus} /></td>
                  <td className="px-6 py-4"><AccountStatusBadge status={user.accountStatus} /></td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${user.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-center">
                    {user.transactionCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {format(parseISO(user.registeredDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionDropdown user={user} />
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
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} users
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
        {paginatedData.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{user.userId}</p>
                <p className="text-lg font-semibold mt-1">{user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <KYCStatusBadge status={user.kycStatus} />
                  <AccountStatusBadge status={user.accountStatus} className="mt-1" />
                </div>
                <ActionDropdown user={user} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <span className="text-gray-500">Total Spent</span>
                <p className="font-bold text-lg">${user.totalSpent.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Transactions</span>
                <p className="font-bold text-lg">{user.transactionCount}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Registered</span>
                <p className="font-medium">{format(parseISO(user.registeredDate), 'MMM dd, yyyy')}</p>
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

export default AllUsersTable;