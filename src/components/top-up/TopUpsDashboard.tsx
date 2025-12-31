"use client";

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTopUps } from '@/redux/thunk/topUpsThunks';
import Link from 'next/link';

const PaymentStatusBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status) return <span className="text-xs text-gray-500">-</span>;
  const s = String(status).toLowerCase();
  const map: Record<string, { label: string; icon: string; bg: string; color: string }> = {
    awaiting_payment: { label: 'Awaiting Payment', icon: '💳', bg: '#FEF3C7', color: '#92400E' },
    payment_pending: { label: 'Payment Pending', icon: '⏳', bg: '#FEF9C3', color: '#854D0E' },
    payment_verified: { label: 'Payment Verified', icon: '✅', bg: '#D1FAE5', color: '#065F46' },
    payment_failed: { label: 'Payment Failed', icon: '❌', bg: '#FEE2E2', color: '#991B1B' },
  };

  const item = map[s] ?? { label: status, icon: '', bg: '#F3F4F6', color: '#111827' };

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: item.bg, color: item.color }}
    >
      <span className="mr-2 leading-none" aria-hidden>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </span>
  );
};

type TopUp = {
  id: string;
  internalId?: string | number;
  date: string;
  amount: number;
  coin: string;
  network: string;
  status: 'completed' | 'processing' | 'pending' | 'rejected' | string;
  paymentStatus?: string | null;
  totalAud?: number | string | null;
  payment_deadline?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  walletAddress: string;
  transactionHash?: string | null;
  adminNotes?: string | null;
};

const TopUpsDashboard = () => {
  const dispatch = useAppDispatch();

  const [page, setPage] = useState<number>(1);
  const status = ''; // empty = all

  const topUpsItems = useAppSelector((s) => s.topUps?.items ?? []);
  const pagination = useAppSelector((s) => s.topUps?.pagination ?? null);
  const loading = useAppSelector((s) => s.topUps?.loading ?? false);

  useEffect(() => {
    dispatch(fetchTopUps({ status, page }));

    const onAdded = () => {
      dispatch(fetchTopUps({ status, page }));
    };

    window.addEventListener('topup:added', onAdded as EventListener);
    return () => window.removeEventListener('topup:added', onAdded as EventListener);
  }, [dispatch, page, status]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
      approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
      processing: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
      rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status.toLowerCase()] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatPaymentStatus = (status?: string | null) => {
    if (!status) return 'Pending';
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const goToPage = (p: number) => {
    if (!pagination) return;
    const to = Math.max(1, Math.min(p, pagination.last_page));
    setPage(to);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Top-Ups</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            View and manage your cryptocurrency top-up requests
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount (AUD)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Coin/Token
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Request Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topUpsItems.map((raw: any) => {
                  const topUp: TopUp = {
                    id: raw.transaction_id ?? String(raw.id),
                    internalId: raw.id,
                    date: raw.created_at ?? '',
                    amount: parseFloat(raw.amount_aud ?? '0'),
                    coin: raw.currency ?? raw.coin ?? '',
                    network: raw.network ?? '',
                    status: (raw.status ?? 'pending').toLowerCase(),
                    paymentStatus: raw.payment_status ?? raw.paymentStatus ?? null,
                    totalAud: raw.total_aud ?? raw.totalAud ?? raw.amount_aud ?? null,
                    payment_deadline: raw.payment_deadline ?? raw.paymentDeadline ?? null,
                    submitted_at: raw.submitted_at ?? raw.submittedAt ?? null,
                    verified_at: raw.verified_at ?? raw.verifiedAt ?? null,
                    rejection_reason: raw.rejection_reason ?? raw.rejectionReason ?? null,
                    walletAddress: raw.wallet_address ?? raw.walletAddress ?? '',
                    transactionHash: raw.transaction_hash ?? raw.transactionHash ?? null,
                    adminNotes: raw.admin_notes ?? raw.adminNotes ?? null,
                  };

                  return (
                    <tr key={topUp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {topUp.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(topUp.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ${topUp.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {topUp.coin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {topUp.network}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <PaymentStatusBadge status={topUp.paymentStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(topUp.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/my-top-up/${topUp.internalId}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium text-sm hover:underline"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {pagination && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing page {pagination.current_page} of {pagination.last_page} — {pagination.total} total
            </div>
            <div className="space-x-2">
              <button
                onClick={() => goToPage(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1 bg-white dark:bg-gray-700 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.last_page}
                className="px-3 py-1 bg-white dark:bg-gray-700 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {!loading && topUpsItems.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-300">No top-up requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUpsDashboard;