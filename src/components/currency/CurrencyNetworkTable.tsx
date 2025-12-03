"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCurrencyNetworks } from '../../redux/slice/currencyNetworksSlice';
import { fetchCurrencyNetworkDetail } from '../../redux/thunk/currencyNetworkThunks';
import { clear as clearCurrencyNetworkDetail } from '../../redux/slice/currencyNetworkSlice';
import { Button } from '../ui/button';
import AddCurrencyNetworkModal from './AddCurrencyNetworkModal';
import UpdateCurrencyNetworkModal from './UpdateCurrencyNetworkModal';

export default function CurrencyNetworkTable() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => (s as any).currencyNetworks ?? { data: [], loading: false });

  const { data: detail, loading: detailLoading, error: detailError } =
    useAppSelector((s) => (s as any).currencyNetworkDetail ?? { data: null, loading: false, error: null });

  const [openRow, setOpenRow] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateId, setUpdateId] = useState<number | null>(null);

  // ---------- PAGINATION STATES ----------
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = useMemo(() => Math.ceil((data?.length || 0) / pageSize), [data]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (data || []).slice(start, start + pageSize);
  }, [data, page]);

  useEffect(() => {
    dispatch(fetchCurrencyNetworks());
  }, [dispatch]);

  return (
    <div>
      <Button className="float-right mb-4">
        <span onClick={() => setCreateOpen(true)}>Add Currency & Network</span>
      </Button>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Currency & Network Table</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow bg-white dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left font-medium">ID</th>
                <th className="px-4 py-2 text-left font-medium">Currency</th>
                <th className="px-4 py-2 text-left font-medium">Network</th>
                <th className="px-4 py-2 text-left font-medium">Contract</th>
                <th className="px-4 py-2 text-left font-medium">Min Amount</th>
                <th className="px-4 py-2 text-left font-medium">Max Amount</th>
                <th className="px-4 py-2 text-left font-medium">Fee (AUD)</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">
                    No Data Found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-200">{row.id}</td>
                    <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">{row.currency?.code}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-200">{row.network?.code}</td>
                    <td className="px-4 py-2 truncate max-w-[200px] text-gray-900 dark:text-gray-200">
                      {row.contract_address ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-200">{row.min_transaction_amount}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-200">{row.max_transaction_amount}</td>
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-200">{row.network_fee_estimate_aud}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          row.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 relative">
                      <button
                        aria-label="actions"
                        onClick={() => setOpenRow(openRow === row.id ? null : row.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        ⋯
                      </button>

                      {openRow === row.id && (
                        <div className="absolute right-2 mt-2 w-32 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow z-10">
                          <button
                            onClick={() => {
                              setDetailOpen(true);
                              dispatch(fetchCurrencyNetworkDetail(row.id));
                              setOpenRow(null);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                          >
                            View
                          </button>
                          <button
                            onClick={() => { setUpdateId(row.id); setUpdateOpen(true); setOpenRow(null); }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                          >
                            Update
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ------------ PAGINATION UI  ------------ */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={() => {
              setDetailOpen(false);
              dispatch(clearCurrencyNetworkDetail());
            }}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[90%] max-w-xl p-6 z-10 text-gray-900 dark:text-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Currency-Network Detail</h3>
              <button
                onClick={() => {
                  setDetailOpen(false);
                  dispatch(clearCurrencyNetworkDetail());
                }}
                className="text-sm text-gray-500 dark:text-gray-300"
              >
                Close
              </button>
            </div>

            {detailLoading ? (
              <div className="py-6 text-center text-gray-700 dark:text-gray-300">Loading...</div>
            ) : detail ? (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div><strong>ID:</strong> {detail.id}</div>
                <div><strong>Currency ID:</strong> {detail.currency_id}</div>
                <div><strong>Network ID:</strong> {detail.network_id}</div>
                <div><strong>Contract:</strong> {detail.contract_address ?? '—'}</div>
                <div><strong>Min Amount:</strong> {detail.min_transaction_amount}</div>
                <div><strong>Max Amount:</strong> {detail.max_transaction_amount}</div>
                <div><strong>Fee (AUD):</strong> {detail.network_fee_estimate_aud}</div>
                <div><strong>Status:</strong> {detail.is_active ? 'Active' : 'Inactive'}</div>
                <div><strong>Created:</strong> {detail.created_at ?? '—'}</div>
                <div><strong>Updated:</strong> {detail.updated_at ?? '—'}</div>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-red-500 dark:text-red-400">{detailError ?? 'No data'}</div>
            )}
          </div>
        </div>
      )}

      <AddCurrencyNetworkModal open={createOpen} onClose={() => setCreateOpen(false)} />
        <UpdateCurrencyNetworkModal open={updateOpen} onClose={() => { setUpdateOpen(false); setUpdateId(null); dispatch(clearCurrencyNetworkDetail()); }} id={updateId} />
    </div>
  );
}
