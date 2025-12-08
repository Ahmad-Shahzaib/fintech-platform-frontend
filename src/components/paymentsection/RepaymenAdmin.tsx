"use client";
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAdminProofs, updateAdminPaymentStatus } from '@/redux/thunk/adminPaymentProofsThunks';
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
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedProofId, setSelectedProofId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { showAlert } = useAlert();

  useEffect(() => {
    dispatch(fetchAdminProofs({ page }));
  }, [dispatch, page]);

  const buildReceiptUrl = (path?: string | null) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fintechapi.softsuitetech.com/api').replace(/\/+$/, '');
    const normalized = path.replace(/^\/+/, '');
    const storageBase = apiBase.replace(/\/api$/i, '/storage');
    if (normalized.startsWith('storage') || normalized.startsWith('receipts')) {
      return `${storageBase}/${normalized}`.replace(/\/+$/, '');
    }
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
        updateAdminPaymentStatus({
          id: selectedProofId,
          verification_status: 'rejected',
          admin_notes: adminNotes || null,
          rejection_reason: rejectionReason || null,
        })
      ).unwrap();
      const msg = res?.message || 'Payment proof rejected';
      showAlert(msg, 'success');
      setShowStatusModal(false);
      setSelectedProofId(null);
      setRejectionReason('');
      setAdminNotes('');
      dispatch(fetchAdminProofs({ page }));
    } catch (err: any) {
      const msg = err || err?.message || 'Failed to reject proof';
      showAlert(msg, 'error');
      dispatch(fetchAdminProofs({ page }));
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
        </div>
        <div>
          <button
            onClick={() => dispatch(fetchAdminProofs({ page }))}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment ID</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount (AUD)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>

                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th> */}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item: any) => (
                <tr key={item.id}>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{item.payment_id}</td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.top_up_transaction_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">{item.user?.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{item.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${item.amount_paid_aud}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.payment_method_name ?? (typeof item.payment_method === 'string' ? item.payment_method : item.payment_method?.name ?? (item.payment_method !== undefined && item.payment_method !== null ? String(item.payment_method) : '-'))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.reference_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.receipt_path ? (
                      <a href={buildReceiptUrl(item.receipt_path)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
                    ) : (
                      <span className="text-gray-400">No receipt</span>
                    )}
                  </td>
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                      {openDropdownId === item.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 py-1">
                          <button
                            onClick={async () => {
                              setOpenDropdownId(null);
                              try {
                                const res = await dispatch(updateAdminPaymentStatus({ id: item.id, verification_status: 'verified', admin_notes: null })).unwrap();
                                const msg = res?.message || 'Payment proof verified';
                                showAlert(msg, 'success');
                                dispatch(fetchAdminProofs({ page }));
                              } catch (err: any) {
                                const msg = err || err?.message || 'Failed to approve';
                                showAlert(msg, 'error');
                                dispatch(fetchAdminProofs({ page }));
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center"
                          >
                            Approved
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

                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : '-'}</td> */}
                </tr>
              ))}
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
    </div>
  );
};

export default RepaymenAdmin;