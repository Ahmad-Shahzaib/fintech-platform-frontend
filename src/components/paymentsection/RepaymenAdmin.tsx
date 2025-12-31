"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAdminProofs, updateAdminPaymentStatus, verifyAdminPayment, rejectAdminPayment } from '@/redux/thunk/adminPaymentProofsThunks';
import { useAlert } from '@/components/common/GlobalAlert';

const RepaymenAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, pagination } = useAppSelector((s) => ({
    data: s.adminPaymentProofs.data,
    loading: s.adminPaymentProofs.loading,
    error: s.adminPaymentProofs.error,
    pagination: s.adminPaymentProofs.pagination,
  }));

  const [page, setPage] = useState(1);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedProofId, setSelectedProofId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState<any | null>(null);

  const { showAlert } = useAlert();

  const pendingCount = useMemo(() => {
    return (data || []).filter((item: any) => String(item.verification_status || '').toLowerCase() === 'pending').length;
  }, [data]);

  const verifiedTodayCount = useMemo(() => {
    const isToday = (d?: string | null) => {
      if (!d) return false;
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return false;
      const now = new Date();
      return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth() && dt.getDate() === now.getDate();
    };

    return (data || []).filter((item: any) => {
      if (String(item.verification_status || '').toLowerCase() !== 'verified') return false;
      return isToday(item.updated_at) || isToday(item.verified_at) || isToday(item.created_at);
    }).length;
  }, [data]);

  const formatTxn = (tx?: string | null) => {
    if (tx == null || tx === '') return '-';
    const s = String(tx);
    if (s.length <= 5) return s;
    return `${s.slice(0, 2)}...${s.slice(-3)}`;
  };

  const displayTxn = (item: any) => {
    const raw = item?.top_up_request?.transaction_id || item?.top_up_transaction_id || item?.transaction_id || item?.payment_id;
    return formatTxn(raw);
  };

  const formatPaymentStatus = (status?: string | null) => {
    if (!status) return '-';
    return String(status)
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const timeAgo = (d?: string | null) => {
    if (!d) return '-';
    const then = new Date(d);
    if (Number.isNaN(then.getTime())) return '-';
    const diff = Date.now() - then.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    return `${days}d ago`;
  };

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptSrc, setReceiptSrc] = useState<string | null>(null);

  const openReceipt = (url?: string) => {
    if (!url) return;
    setReceiptSrc(url);
    setShowReceiptModal(true);
  };

  useEffect(() => {
    console.debug('[RepaymenAdmin] fetching admin proofs', { page, payment_status: paymentStatusFilter });
    dispatch(fetchAdminProofs({ page, payment_status: paymentStatusFilter }));
  }, [dispatch, page, paymentStatusFilter]);

  const buildReceiptUrl = (path?: string | null) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fintechapi.softsuitetech.com/api').replace(/\/+$/, '');
    const normalized = path.replace(/^\/+/, '');
    const baseNoApi = apiBase.replace(/\/api$/i, '');
    const storageBase = `${baseNoApi}/storage`.replace(/\/+$/, '');

    // If the stored path references storage-like locations (storage, receipts, payment-proofs),
    // normalize to a single /storage/ prefix so files served from storage are reachable.
    if (/^(storage|receipts|payment-?proofs)\//i.test(normalized) || /payment-?proofs/i.test(normalized)) {
      const withoutStorage = normalized.replace(/^storage\/?/i, '');
      return `${storageBase}/${withoutStorage}`.replace(/\/+$/, '');
    }

    // Default: assume path is relative to the API base
    return `${apiBase}/${normalized}`.replace(/\/+$/, '');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'verified':
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  const confirmReject = async () => {
    if (!selectedProofId) return;
    try {
      const res = await dispatch(
        rejectAdminPayment({ id: selectedProofId, rejection_reason: rejectionReason || 'Payment rejected by admin' })
      ).unwrap();
      const msg = res?.message || 'Payment proof rejected';
      showAlert(msg, 'success');
      setShowStatusModal(false);
      setSelectedProofId(null);
      setRejectionReason('');
      setAdminNotes('');
      console.debug('[RepaymenAdmin] refetch after reject', { page, payment_status: paymentStatusFilter });
      dispatch(fetchAdminProofs({ page, payment_status: paymentStatusFilter }));
    } catch (err: any) {
      const msg = err || err?.message || 'Failed to reject proof';
      showAlert(msg, 'error');
      console.debug('[RepaymenAdmin] refetch after failed reject', { page, payment_status: paymentStatusFilter });
      dispatch(fetchAdminProofs({ page, payment_status: paymentStatusFilter }));
    }
  };

  if (loading) return <div className="p-6">Loading proofs...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-visible sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Payment Proofs</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">View all submitted payment proofs</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg px-4 py-2">
              <div className="flex-shrink-0 p-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11a.75.75 0 00-1.5 0v3.5c0 .207.084.41.233.56l2.5 2.5a.75.75 0 001.06-1.06L10.75 9.69V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Pending</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{pendingCount}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg px-4 py-2">
              <div className="flex-shrink-0 p-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.22-10.78a.75.75 0 10-1.06-1.06L9 9.34 7.84 8.22a.75.75 0 10-1.08 1.04l1.75 1.83c.3.31.77.31 1.07 0l4.64-4.67z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Verified Today</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{verifiedTodayCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-300">Status</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            aria-label="Filter by payment status"
          >
            <option value="">All Payment Statuses</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="payment_verified">Payment Verified</option>
            <option value="payment_failed">Payment Failed</option>
          </select>

          <button
            onClick={() => {
              console.debug('[RepaymenAdmin] manual refresh', { page, payment_status: paymentStatusFilter });
              dispatch(fetchAdminProofs({ page, payment_status: paymentStatusFilter }));
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {data && data.length > 0 ? (
        (() => {
          const filtered = (data || []).filter((item: any) => {
            if (!paymentStatusFilter || paymentStatusFilter === '') return true;
            const raw = (item.top_up_request && item.top_up_request.payment_status) || item.payment_status || '';
            return String(raw).toLowerCase() === String(paymentStatusFilter).toLowerCase();
          });

          return (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">REQUEST ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">USER</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">AMOUNT OWED</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">AMOUNT PAID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">METHOD</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">REFERENCE</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">RECEIPT</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SUBMITTED</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">STATUS</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((item: any) => {
                    const reqId = item.top_up_request?.id || item.top_up_request?.request_id || '-';
                    const amountOwed = item.top_up_request?.total_aud ?? item.top_up_request?.amount_aud ?? '-';
                    const amountPaid = item.amount_paid_aud ?? '-';
                    const paidNum = parseFloat(String(amountPaid || '0')) || 0;
                    const owedNum = parseFloat(String(amountOwed || '0')) || 0;
                    const mismatch = owedNum !== 0 && Math.abs(paidNum - owedNum) > 0.0001;

                    return (
                      <tr key={item.id}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {reqId !== '-' ? (
                            <a href={`/admin/requests/${reqId}`} className="text-blue-600 hover:underline">{reqId}</a>
                          ) : ('-')}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{displayTxn(item)}</td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-200">{item.user?.name || '-'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">{item.user?.email || ''}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 text-right">${amountOwed}</td>
                        <td className={`px-3 py-4 whitespace-nowrap text-sm text-right ${mismatch ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-700 dark:text-gray-200'}`}>
                          ${amountPaid}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {item.payment_method_name ?? (typeof item.payment_method === 'string' ? item.payment_method : item.payment_method?.name ?? (item.payment_method !== undefined && item.payment_method !== null ? String(item.payment_method) : '-'))}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">{item.reference_number || '-'}</td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {item.receipt_path ? (
                            <button onClick={() => openReceipt(buildReceiptUrl(item.receipt_path))} className="text-blue-600 hover:underline">View</button>
                          ) : (
                            <span className="text-gray-400">No receipt</span>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{timeAgo(item.created_at || item.top_up_request?.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.verification_status || '')}`}>
                            {item.verification_status || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <div className="relative inline-block text-left dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                              }}
                              className="inline-flex justify-center w-full rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                             
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </button>
                            {openDropdownId === item.id && (
                              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 py-1">
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setDetailItem(item);
                                    setShowDetailModal(true);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    try {
                                      const proofId = item.id ?? item.top_up_request?.id;
                                      const res = await dispatch(verifyAdminPayment({ id: proofId, admin_notes: null })).unwrap();
                                      const msg = res?.message || 'Payment proof verified';
                                      showAlert(msg, 'success');
                                      console.debug('[RepaymenAdmin] refetch after approve', { page, payment_status: paymentStatusFilter });
                                      dispatch(fetchAdminProofs({ page, payment_status: paymentStatusFilter }));
                                    } catch (err: any) {
                                      const msg = err || err?.message || 'Failed to approve';
                                      showAlert(msg, 'error');
                                      console.debug('[RepaymenAdmin] refetch after failed approve', { page, payment_status: paymentStatusFilter });
                                      dispatch(fetchAdminProofs({ page, payment_status: paymentStatusFilter }));
                                    }
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-400 hover:text-white dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center"
                                >
                                  Verify Payment
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setSelectedProofId(item.id);
                                    setStatusAction('reject');
                                    setRejectionReason('');
                                    setAdminNotes('');
                                    setShowStatusModal(true);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors flex items-center"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {pagination && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300">Showing page {pagination.current_page} of {pagination.last_page}</div>
                  <div className="space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 bg-white dark:bg-gray-700 border rounded disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 bg-white dark:bg-gray-700 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No proofs found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">There are no payment proofs to display.</p>
        </div>
      )}
      {/* Reject modal */}
      {showStatusModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100000] dark:bg-black/60">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowStatusModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 z-50 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Reject Payment Proof</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">Close</button>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rejection reason</div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border rounded px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Admin notes (optional)</div>
              <input value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="w-full border rounded px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowStatusModal(false)} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm">Cancel</button>
              <button onClick={confirmReject} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
            </div>
          </div>
        </div>
      )}
      {showReceiptModal && receiptSrc && (
        <div className="fixed inset-0 flex items-center justify-center z-[100000] dark:bg-black/60">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowReceiptModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl p-4 z-50 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Receipt</h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">Close</button>
            </div>
            <div className="w-full h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded">
              <img src={receiptSrc} alt="receipt" className="max-h-[56vh] object-contain" />
            </div>
          </div>
        </div>
      )}
      {showDetailModal && detailItem && (
        <div className="fixed inset-0 flex items-center justify-center z-[100000] dark:bg-black/60">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowDetailModal(false)} />
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 z-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Payment Proof Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Transaction ID</div>
                <div className="font-medium">{displayTxn(detailItem)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">User</div>
                <div className="font-medium">{detailItem.user?.name || '-'}<div className="text-xs text-gray-400">{detailItem.user?.email}</div></div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Amount (AUD)</div>
                <div className="font-medium">{detailItem.amount_paid_aud || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Payment Status</div>
                <div className="font-medium">{formatPaymentStatus(detailItem.top_up_request?.payment_status || detailItem.payment_status)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Reference</div>
                <div className="font-medium">{detailItem.reference_number || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Receipt</div>
                <div className="font-medium">{detailItem.receipt_path ? <a href={buildReceiptUrl(detailItem.receipt_path)} target="_blank" rel="noreferrer" className="text-blue-600">View receipt</a> : 'No receipt'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-medium">{detailItem.verification_status || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Admin Notes</div>
                <div className="font-medium">{detailItem.admin_notes || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500">Rejection Reason</div>
                <div className="font-medium">{detailItem.rejection_reason || '-'}</div>
              </div>
            </div>
           
          </div>
        </div>
      )}
    </div>
  );
};

export default RepaymenAdmin;