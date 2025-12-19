"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTransactions, exportTransactionsToExcel } from '@/redux/thunk/transactionsThunks';
import type { Transaction } from '@/redux/thunk/transactionsThunks';
import { Button } from './ui/button';
import ExcelJS from 'exceljs';

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
  const dispatch = useAppDispatch();
  const { items: transactions, loading, pagination } = useAppSelector(state => state.transactions);
  
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Handle Excel Export (Client-side)
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Use filtered transactions currently displayed
      const dataToExport = displayTransactions;

      if (dataToExport.length === 0) {
        alert('No transactions to export');
        setIsExporting(false);
        return;
      }

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transactions');

      // Define columns
      worksheet.columns = [
        { header: 'Transaction ID', key: 'transactionId', width: 18 },
        { header: 'Date', key: 'date', width: 20 },
        { header: 'User Name', key: 'userName', width: 18 },
        { header: 'Currency', key: 'currencyCode', width: 12 },
        { header: 'Network', key: 'networkName', width: 15 },
        { header: 'Amount (AUD)', key: 'amountAud', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
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
      dataToExport.forEach((txn) => {
        worksheet.addRow({
          transactionId: txn.transactionId,
          date: format(parseISO(txn.date), 'MMM dd, yyyy HH:mm:ss'),
          userName: txn.userName,
          currencyCode: txn.currencyCode,
          networkName: txn.networkName,
          amountAud: String(txn.amountAud),
          status: txn.status,
        });
      });

      // Format amount column as currency
      worksheet.getColumn('amountAud').numFmt = '$#,##0.00';

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
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`Successfully exported ${dataToExport.length} transactions`);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error?.message || error || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRange, statusFilter]);

  // Fetch transactions when filters or page change
  useEffect(() => {
    const params: any = { page: currentPage };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    
    if (selectedRange.from && selectedRange.to) {
      params.from_date = format(selectedRange.from, 'yyyy-MM-dd');
      params.to_date = format(selectedRange.to, 'yyyy-MM-dd');
    }
    
    dispatch(fetchTransactions(params));
  }, [dispatch, currentPage, statusFilter, selectedRange]);

  // Format display value
  const dateRangeDisplay = selectedRange.from && selectedRange.to
    ? `${format(selectedRange.from, 'yyyy-MM-dd')} to ${format(selectedRange.to, 'yyyy-MM-dd')}`
    : '';

  // Base mapped transactions
  const mappedTransactions = transactions.map((txn) => ({
    ...txn,
    id: String(txn.id),
    transactionId: txn.transaction_id,
    date: txn.created_at,
    userName: txn.user?.name || 'N/A',
    currencyCode: txn.currency?.code || 'N/A',
    networkName: txn.network?.name || 'N/A',
    amountAud: parseFloat(txn.amount_aud),
    parsedDate: parseISO(txn.created_at), // For client-side filtering
  }));

  // Client-side date range filtering
  const filteredTransactions = selectedRange.from && selectedRange.to
    ? mappedTransactions.filter((txn) => {
        return isWithinInterval(txn.parsedDate, {
          start: startOfDay(selectedRange.from!),
          end: endOfDay(selectedRange.to!),
        });
      })
    : mappedTransactions;

  // Use filtered list for display
  const displayTransactions = filteredTransactions;

  // Total pages (fallback to client-side count if no pagination)
  const totalPages = pagination?.last_page || Math.ceil(displayTransactions.length / 8);
  const totalItems = pagination?.total || displayTransactions.length;

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

  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prev) => (prev === String(id) ? null : String(id)));
  };

  const ActionDropdown = ({ txn }: { txn: any }) => (
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

      {openDropdownId === String(txn.id) && (
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              ) : displayTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                displayTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-gray-100">{txn.transactionId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{format(parseISO(txn.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{txn.userName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {txn.currencyCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{txn.networkName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">${txn.amountAud.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-6 py-4"><StatusBadge status={txn.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <ActionDropdown txn={txn} />
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
            Showing {displayTransactions.length > 0 ? displayTransactions.length : '0'} {displayTransactions.length > 0 && `of ${totalItems}`} transactions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Cards - Same filtering applied */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-500">Loading transactions...</span>
          </div>
        ) : displayTransactions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          <>
            {displayTransactions.map((txn) => (
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
                  <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-lg font-bold">${txn.amountAud.toLocaleString('en-AU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Crypto</span><span className="font-medium">{txn.currencyCode} ({txn.networkName})</span></div>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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

export default AllTransactionsTable;