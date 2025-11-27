"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCurrencyNetworks } from '../../redux/slice/currencyNetworksSlice';
import { Button } from '../ui/button';

export default function CurrencyNetworkTable() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => (s as any).currencyNetworks ?? { data: [], loading: false });
  const [openRow, setOpenRow] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchCurrencyNetworks());
  }, [dispatch]);

  return (
   <div>
     <Button className='float-right mb-4' >
        Add Currency & Network
      </Button>
     <div className="p-6">
        
      <h2 className="text-xl font-semibold mb-4">Currency & Network Table</h2>
      {/*  button add currency and network */}

     

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-gray-100">
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

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : (
              (data || []).map((row: any) => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{row.id}</td>
                  <td className="px-4 py-2 font-semibold">{row.currency?.code}</td>
                  <td className="px-4 py-2">{row.network?.code}</td>
                  <td className="px-4 py-2 truncate max-w-[200px]">
                    {row.contract_address ?? '—'}
                  </td>
                  <td className="px-4 py-2">{row.min_transaction_amount}</td>
                  <td className="px-4 py-2">{row.max_transaction_amount}</td>
                  <td className="px-4 py-2">{row.network_fee_estimate_aud}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {row.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 relative">
                    <button
                      aria-label="actions"
                      onClick={() => setOpenRow(openRow === row.id ? null : row.id)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      ⋯
                    </button>

                    {openRow === row.id && (
                      <div className="absolute right-2 mt-2 w-32 bg-white border rounded shadow z-10">
                        <button
                          onClick={() => alert(`View ${row.id}`)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => alert(`Update ${row.id}`)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
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
    </div>
   </div>
  );
}
