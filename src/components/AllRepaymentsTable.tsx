// components/AllRepaymentsTable.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPayments, exportPaymentsToExcel } from '@/redux/thunk/paymentsListThunks';
import type { Payment } from '@/redux/thunk/paymentsListThunks';
import { Button } from './ui/button';
import ExcelJS from 'exceljs';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const variant = variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variant}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {label}
    </span>
  );
};

const AllRepaymentsTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: payments, loading, pagination } = useAppSelector(state => state.paymentsList);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;
  const today = new Date();

  // Handle Excel Export (Client-side)
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Use current displayed payments
      const dataToExport = displayRepayments;

      if (dataToExport.length === 0) {
        alert('No payments to export');
        setIsExporting(false);
        return;
      }

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Repayments');

      // Define columns
      worksheet.columns = [
        { header: 'Payment ID', key: 'repaymentId', width: 18 },
        { header: 'User Name', key: 'userName', width: 18 },
        { header: 'Transaction ID', key: 'transactionId', width: 18 },
        { header: 'Amount Paid (AUD)', key: 'amountDue', width: 18 },
        { header: 'Payment Date', key: 'payment_date', width: 18 },
        { header: 'Due Date', key: 'dueDate', width: 18 },
        { header: 'Verification Status', key: 'status', width: 16 },
        { header: 'Payment Method', key: 'payment_method', width: 15 },
        { header: 'Reference Number', key: 'reference_number', width: 18 },
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
      dataToExport.forEach((payment) => {
        worksheet.addRow({
          repaymentId: payment.repaymentId,
          userName: payment.userName,
          transactionId: payment.transactionId,
          amountDue: parseFloat(String(payment.amountDue)),
          payment_date: format(parseISO(payment.payment_date), 'MMM dd, yyyy'),
          dueDate: format(parseISO(payment.dueDate), 'MMM dd, yyyy'),
          status: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
          payment_method: payment.payment_method || 'N/A',
          reference_number: payment.reference_number || 'N/A',
        });
      });

      // Format currency column
      worksheet.getColumn('amountDue').numFmt = '$#,##0.00';

      // Center align status column
      worksheet.getColumn('status').alignment = { horizontal: 'center' };

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `repayments_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`Successfully exported ${dataToExport.length} payments`);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error?.message || error || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, overdueOnly]);

  // Fetch payments when page or filters change
  useEffect(() => {
    const params: any = {
      page: currentPage,
      per_page: itemsPerPage,
    };

    if (statusFilter) {
      params.verification_status = statusFilter;
    }

    dispatch(fetchPayments(params));
  }, [dispatch, currentPage, statusFilter, overdueOnly]); // Add overdueOnly here too

  // Map API response to display format
  const displayRepayments = payments
    .map((payment) => ({
      ...payment,
      id: String(payment.id),
      repaymentId: payment.payment_id,
      userName: payment.user?.name || 'N/A',
      transactionId: payment.top_up_request?.transaction_id || 'N/A',
      amountDue: parseFloat(payment.amount_paid_aud),
      status: payment.verification_status,
      dueDate: payment.top_up_request?.repayment_due_date || payment.payment_date,
    }))
    .filter((rep) => {
      if (overdueOnly) {
        const due = parseISO(rep.dueDate);
        return rep.status !== 'verified' && due < today;
      }
      return true;
    });

  const totalPages = pagination?.last_page || 1;
  const totalItems = pagination?.total || 0;

  // Displayed count after client-side filter
  const displayedCount = displayRepayments.length;

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

  const ActionDropdown = ({ rep }: { rep: any }) => (
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

      {openDropdownId === String(rep.id) && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                alert(`Marked as Verified: ${rep.payment_id}`);
                setOpenDropdownId(null);
              }}
              disabled={rep.verification_status === 'verified'}
              className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Mark as Verified
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
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading payments...
                    </div>
                  </td>
                </tr>
              ) : displayRepayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                displayRepayments.map((rep) => (
                  <tr key={rep.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{rep.repaymentId}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{rep.userName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{rep.transactionId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${rep.amountDue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {format(parseISO(rep.dueDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={rep.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <ActionDropdown rep={rep} />
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
            Showing {displayedCount > 0 ? displayedCount : '0'} {overdueOnly ? 'overdue ' : ''}payments
            {statusFilter ? ` (${statusFilter})` : ''}
            {` of ${totalItems} total`}
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
            <span className="text-gray-500">Loading payments...</span>
          </div>
        ) : displayRepayments.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No payments found
          </div>
        ) : (
          <>
            {displayRepayments.map((rep) => (
              <div key={rep.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment ID</p>
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
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="text-lg font-bold">
                      ${rep.amountDue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-medium">{format(parseISO(rep.dueDate), 'MMM dd, yyyy')}</span>
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

export default AllRepaymentsTable;