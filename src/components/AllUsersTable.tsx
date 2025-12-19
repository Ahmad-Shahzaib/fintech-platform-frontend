// components/AllUsersTable.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllUsers, exportUsersToExcel } from '@/redux/thunk/usersListThunks';
import type { UserResponse } from '@/redux/thunk/usersListThunks';
import { Button } from './ui/button';
import ExcelJS from 'exceljs';

const KYCStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (!status) return <span className="text-gray-500 text-xs">Not available</span>;

  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const label = status === 'under_review' ? 'Under Review' : status.charAt(0).toUpperCase() + status.slice(1);
  const variant = variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variant}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

const AccountStatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  const variants: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const variant = variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${variant} ${className ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};

const AllUsersTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: users, loading, pagination } = useAppSelector(state => state.usersList);

  const [accountFilter, setAccountFilter] = useState<string>('');
  const [kycFilter, setKycFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 8;

  // Handle Excel Export (Client-side)
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Use current displayed users
      const dataToExport = displayUsers;

      if (dataToExport.length === 0) {
        alert('No users to export');
        setIsExporting(false);
        return;
      }

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      // Define columns
      worksheet.columns = [
        { header: 'User ID', key: 'userId', width: 15 },
        { header: 'Name', key: 'name', width: 18 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'KYC Status', key: 'kycStatus', width: 14 },
        { header: 'Account Status', key: 'accountStatus', width: 15 },
        { header: 'Transaction Limit', key: 'transaction_limit', width: 18 },
        { header: 'Total Borrowed', key: 'total_borrowed', width: 16 },
        { header: 'Total Repaid', key: 'total_repaid', width: 16 },
        { header: 'Completed Txns', key: 'completed_transactions', width: 15 },
        { header: 'Registered Date', key: 'registeredDate', width: 18 },
        { header: '2FA Enabled', key: 'two_factor_enabled', width: 12 },
        { header: 'Last Login', key: 'last_login_at', width: 20 },
      ];

      // Style header row
      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1e40af' },
      };
      worksheet.getRow(1).alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };

      // Add data rows
      dataToExport.forEach((user) => {
        worksheet.addRow({
          userId: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          kycStatus: user.kycStatus,
          accountStatus: user.accountStatus,
          transaction_limit: user.transaction_limit,
          total_borrowed: user.total_borrowed,
          total_repaid: user.total_repaid,
          completed_transactions: user.completed_transactions,
          registeredDate: format(parseISO(user.registeredDate), 'MMM dd, yyyy'),
          two_factor_enabled: user.two_factor_enabled ? 'Yes' : 'No',
          last_login_at: user.last_login_at ? format(parseISO(user.last_login_at), 'MMM dd, yyyy HH:mm:ss') : 'Never',
        });
      });

      // Format currency columns
      worksheet.getColumn('transaction_limit').numFmt = '$#,##0.00';
      worksheet.getColumn('total_borrowed').numFmt = '$#,##0.00';
      worksheet.getColumn('total_repaid').numFmt = '$#,##0.00';

      // Center align status columns
      worksheet.getColumn('kycStatus').alignment = { horizontal: 'center' };
      worksheet.getColumn('accountStatus').alignment = { horizontal: 'center' };
      worksheet.getColumn('two_factor_enabled').alignment = { horizontal: 'center' };

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`Successfully exported ${dataToExport.length} users`);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error?.message || error || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch users on mount and when filters change
  useEffect(() => {
    const params: any = { page: currentPage };
    
    if (accountFilter) {
      params.status = accountFilter;
    }
    
    if (kycFilter) {
      params.kyc_status = kycFilter;
    }
    
    dispatch(fetchAllUsers(params));
  }, [dispatch, currentPage, accountFilter, kycFilter]);

  // Map API response to display format
  const displayUsers = users.map((user) => ({
    ...user,
    userId: `USR-${user.id}`,
    kycStatus: user.kyc_verification?.status || 'pending',
    accountStatus: user.status,
    totalSpent: parseFloat(user.total_borrowed) || 0,
    transactionCount: user.completed_transactions,
    registeredDate: user.created_at
  }));

  // Total pages from pagination
  const totalPages = pagination?.last_page || 1;
  const totalItems = pagination?.total || 0;

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

  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prev) => (prev === String(id) ? null : String(id)));
  };

  const ActionDropdown = ({ user }: { user: UserResponse }) => (
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

      {openDropdownId === String(user.id) && (
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
                  alert(`User ${user.id} suspended`);
                }
                setOpenDropdownId(null);
              }}
              disabled={user.status === 'suspended'}
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
            <Button
              onClick={handleExport}
              disabled={isExporting || loading}
              className={isExporting ? 'opacity-70 cursor-not-allowed' : ''}
            >
              {isExporting ? 'Exporting...' : 'Exports'}
            </Button>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acco Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Trans Limit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Total Repaid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{user.userId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="px-6 py-4"><KYCStatusBadge status={user.kycStatus} /></td>
                    <td className="px-6 py-4"><AccountStatusBadge status={user.accountStatus} /></td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${user.transaction_limit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-center">
                      {user.total_repaid}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {format(parseISO(user.registeredDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionDropdown user={user} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing {displayUsers.length > 0 ? 'users' : '0'} {displayUsers.length > 0 && `of ${totalItems}`} users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-500">Loading users...</span>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <>
            {displayUsers.map((user) => (
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
                    <p className="font-bold text-lg">${user.transaction_limit}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Repaid</span>
                    <p className="font-bold text-lg">{user.total_repaid}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Registered</span>
                    <p className="font-medium">{format(parseISO(user.registeredDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Mobile Pagination */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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