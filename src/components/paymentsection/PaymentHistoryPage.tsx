// pages/payment-history.js
"use client";
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchMyProofs } from '@/redux/thunk/paymentProofsThunks';
import { useModal } from '../../hooks/useModal';

// Add this new modal component that matches the design from users.js
const RepaymentDetailsModal = ({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[100000]">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
};

const PaymentHistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const dispatch = useAppDispatch();

  // Format payment method keys/objects into user-friendly labels
  const formatMethod = (method?: any) => {
    if (method === undefined || method === null) return '';

    // If API provides a human readable field, it will be passed as a string (e.g. "Bank Transfer").
    // Some responses use a numeric id for `payment_method` and also include `payment_method_name`.
    // Handle: string, object { name }, number id.
    if (typeof method === 'string') {
      return method;
    }

    if (typeof method === 'number') {
      const numMap: Record<number, string> = {
        1: 'Bank Transfer',
        2: 'PayPal',
        3: 'Card'
      };
      return numMap[method] || String(method);
    }

    if (typeof method === 'object') {
      const name = method?.name ?? method?.payment_method_name ?? method?.payment_method_name;
      if (name) return String(name);
    }

    return String(method || '');
  };
  // Read slice fields explicitly to avoid destructuring issues
  const proofs = useAppSelector((s) => (s.paymentProofs as any)?.data ?? []);
  const loading = useAppSelector((s) => (s.paymentProofs as any)?.loading ?? false);

  useEffect(() => {
    dispatch(fetchMyProofs());
  }, [dispatch]);

  // Filter payments based on search and filters
  // Transform proofs to table rows
  const payments = (proofs || []).map((p: any) => ({
    id: p.payment_id || p.id,
    date: p.submitted_at || p.created_at || '',
    description: `Top-up ${p.top_up_transaction_id || ''}`,
    amount: Number(p.amount_paid_aud) || 0,
    status: p.verification_status || 'pending',
    // Prefer the readable name returned by the API, fall back to the raw payment_method value
    method: p.payment_method_name ?? p.payment_method,
    // Add bank name (API may return top-level `bank_name` or nested `bank.bank_name`)
    bankName: (p.bank?.bank_name || p.bank_name || p.bank?.account_name || '')?.toString().trim(),
    invoice: p.payment_id || '',
    raw: p,
  }));

  // Debug: print first few mapped payments in dev so we can confirm bankName
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('PaymentHistory - mapped payments sample:', payments.slice(0, 5));
  }

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  // Pagination: show 10 records per page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredPayments = payments.filter((payment: any) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (payment.description || '').toLowerCase().includes(q) ||
      (payment.id || '').toLowerCase().includes(q) ||
      (payment.invoice || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || (payment.status || '').toLowerCase() === statusFilter;

    const paymentDate = payment.date ? new Date(payment.date) : null;
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === 'last30' && paymentDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesDate = paymentDate >= thirtyDaysAgo;
    } else if (dateFilter === 'last90' && paymentDate) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      matchesDate = paymentDate >= ninetyDaysAgo;
    } else if (dateFilter === 'thisYear' && paymentDate) {
      matchesDate = paymentDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Reset to first page when filters/search/payments change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, payments.length]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  // Ensure current page is within bounds when filtered list changes
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge component (align classes with other components)
  const StatusBadge = ({ status }: { status: string }) => {
    const statusKey = (status || '').toLowerCase();
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
      approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
      verified: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
      processing: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
      rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
      failed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
      refunded: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
    };

    const display = (statusKey || 'unknown').replace(/_/g, ' ');

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[statusKey] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}`}>
        {display.charAt(0).toUpperCase() + display.slice(1)}
      </span>
    );
  };

  const openDetails = (payment: any) => {
    setSelectedPayment(payment.raw ?? payment);
    openModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <Head>
        <title>Payment History | Topify Omega</title>
        <meta name="description" content="View your payment history and download invoices" />
      </Head>
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Payments</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{payments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Spent</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${payments.reduce((sum: number, payment: any) => sum + payment.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300">Last Payment</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatDate(payments[0]?.date || 'N/A')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Payment History</h1>
          <p className="text-gray-600 mt-1 dark:text-gray-300">View and manage your past payments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>


            </div>
          </div>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment ID
                  </th>

                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>

                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Bank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-sm text-gray-600 dark:text-gray-300">Loading payments…</div>
                    </td>
                  </tr>
                ) : filteredPayments.length > 0 ? (
                  paginatedPayments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {payment.id}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {payment.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ${payment.amount.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatMethod(payment.method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {payment.bankName || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {payment.date ? formatDate(payment.date) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="pr-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openDetails(payment)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full   text-gray-600 dark:text-gray-300"
                          aria-label="Open actions"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No payments found</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {filteredPayments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredPayments.length)} of {filteredPayments.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Prev
            </button>

            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const active = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Repayment Details Modal - Using the new design */}
        <RepaymentDetailsModal
          isOpen={isOpen}
          onClose={() => {
            setSelectedPayment(null);
            closeModal();
          }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Repayment Details</h3>
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  closeModal();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!selectedPayment ? (
              <p className="text-sm text-gray-500 mt-3">No payment selected.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Payment ID</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment.payment_id ?? selectedPayment.paymentId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Amount Paid</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{'$' + Number((selectedPayment.amount_paid_aud ?? selectedPayment.amount) ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Reference</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment.reference_number ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Bank</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{
                        (selectedPayment?.bank?.bank_name || selectedPayment?.bank?.account_name || selectedPayment?.bank_name) ?? '—'
                      }</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment.payment_date ? formatDate(selectedPayment.payment_date) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Verification Status</p>
                      <div className="mt-1">
                        <StatusBadge status={String(selectedPayment.verification_status ?? selectedPayment.verificationStatus ?? 'unknown')} />
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPayment.top_up_request && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-2">
                    <p className="text-sm text-gray-500">Repayment Due Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPayment.top_up_request.repayment_due_date ? formatDate(selectedPayment.top_up_request.repayment_due_date) : '—'}</p>

                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Repayment Amount</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{'$' + Number(selectedPayment.top_up_request.repayment_amount_aud ?? 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Repayment Status</p>
                        <div className="mt-1">
                          <StatusBadge status={String(selectedPayment.top_up_request.repayment_status ?? 'unknown')} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment.receipt_path && (
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500">Receipt</p>
                    <a
                      className="text-blue-600 hover:underline"
                      href={
                        selectedPayment.receipt_path.startsWith('http')
                          ? selectedPayment.receipt_path
                          : (() => {
                            const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://fintechapi.softsuitetech.com/api';
                            // Remove a trailing /api if present so storage URL points to the public files host
                            const storageBase = raw.replace(/\/api\/?$/, '').replace(/\/+$/, '');
                            return `${storageBase}/storage/${selectedPayment.receipt_path}`;
                          })()
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      View receipt
                    </a>
                  </div>
                )}


              </div>
            )}
          </div>
        </RepaymentDetailsModal>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;