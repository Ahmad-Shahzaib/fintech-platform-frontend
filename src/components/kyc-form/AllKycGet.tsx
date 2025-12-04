"use client";

import React, { useEffect } from 'react';
import { fetchAdminAllKyc } from '../../redux/thunk/adminAllKycThunks';
import { fetchAdminKycDetail } from '../../redux/thunk/adminKycThunks';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useState, useMemo } from 'react';

const AllKycGet: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list, loading, error, pagination } = useAppSelector((s) => s.adminAllKyc);
  const adminKycState = useAppSelector((s) => s.adminKyc);

  const detail = adminKycState.detail?.data;

  const [page, setPage] = useState<number>(pagination?.current_page ?? 1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAdminAllKyc({ page }));
  }, [dispatch, page]);

  const users = Array.isArray(list) ? list : [];
  const meta = pagination;

  const pagesToRender = useMemo(() => {
    const tp = meta?.last_page ?? 1;
    const curr = meta?.current_page ?? page;
    if (tp <= 9) return Array.from({ length: tp }, (_, i) => i + 1);
    const pages = new Set<number>();
    pages.add(1);
    pages.add(2);
    pages.add(tp - 1);
    pages.add(tp);
    for (let i = curr - 2; i <= curr + 2; i++) {
      if (i > 2 && i < tp - 1) pages.add(i);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }, [meta, page]);

  const openKycDetail = async (id: number) => {
    try {
      await dispatch(fetchAdminKycDetail(id));
      setIsDetailOpen(true);
    } catch (err) {
      console.error('Failed to fetch kyc detail', err);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">All KYC Records</h3>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Submitted At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">Loading...</td>
                  </tr>
                ) : (
                  users.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">{item.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{item.document_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : item.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                                onClick={() => {
                                  openKycDetail(item.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path d="M2.05 12C3.43 7.36 7.4 4 12 4s8.57 3.36 9.95 8c-1.38 4.64-5.35 8-9.95 8S3.43 16.64 2.05 12z" />
                                </svg>
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing <span className="font-medium">{(meta as any).from ?? 1}</span> to <span className="font-medium">{(meta as any).to ?? users.length}</span> of <span className="font-medium">{(meta as any).total ?? users.length}</span> entries
            </div>

            <nav className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage(Math.max(1, (meta.current_page || 1) - 1))}
                disabled={(meta.current_page || 1) <= 1}
                className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:border-gray-600"
              >
                Prev
              </button>

              {pagesToRender.map((p, idx) => {
                const prev = pagesToRender[idx - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-2 text-sm text-gray-400">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-md border text-sm ${p === (meta.current_page || 1) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

              <button
                onClick={() => setPage(Math.min((meta.last_page || 1), (meta.current_page || 1) + 1))}
                disabled={(meta.current_page || 1) >= (meta.last_page || 1)}
                className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:border-gray-600"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* KYC Detail Modal */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100000]">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">KYC Detail</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">Close</button>
            </div>

            {adminKycState.detailLoading ? (
              <div className="text-gray-600 dark:text-gray-300">Loading...</div>
            ) : adminKycState.detailError ? (
              <div className="text-red-500">{adminKycState.detailError}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Full name</div>
                  <div className="font-medium text-gray-900 dark:text-white">{adminKycState.detail?.data?.full_name ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                  <div className="font-medium text-gray-900 dark:text-white">{adminKycState.detail?.data?.user?.email ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Document Type</div>
                  <div className="font-medium text-gray-900 dark:text-white">{adminKycState.detail?.data?.document_type ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                  <div className="font-medium text-gray-900 dark:text-white">{adminKycState.detail?.data?.status ?? '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Submitted At</div>
                  <div className="font-medium text-gray-900 dark:text-white">{adminKycState.detail?.data?.submitted_at ?? '-'}</div>
                </div>
                {detail?.status !== 'approved' && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Rejection Reason</div>
                    <div className="font-medium text-gray-900 dark:text-white">{detail?.rejection_reason ?? '-'}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllKycGet;