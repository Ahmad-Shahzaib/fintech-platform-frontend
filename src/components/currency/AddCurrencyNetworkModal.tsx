"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCurrencies } from '../../redux/thunk/currencyThunks';
import { fetchNetworks } from '../../redux/thunk/networkThunks';
import { createCurrencyNetwork, CurrencyNetworkDetail } from '../../redux/thunk/currencyNetworkThunks';
import { clearCreate } from '../../redux/slice/currencyNetworkCreateSlice';
import { fetchCurrencyNetworks } from '../../redux/slice/currencyNetworksSlice';
import { Button } from '../ui/button';

export default function AddCurrencyNetworkModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const currencies = useAppSelector((s) => (s as any).currencies?.items ?? []);
  const networks = useAppSelector((s) => (s as any).networks?.items ?? []);
  const createState = useAppSelector((s) => (s as any).currencyNetworkCreate ?? { data: null, loading: false, error: null });

  const [form, setForm] = useState({
    currency_id: '',
    network_id: '',
    contract_address: '',
    min_transaction_amount: '',
    max_transaction_amount: '',
    network_fee_estimate_aud: '',
    is_active: true,
  });

  useEffect(() => {
    if (!currencies || currencies.length === 0) dispatch(fetchCurrencies());
    if (!networks || networks.length === 0) dispatch(fetchNetworks());
  }, [dispatch]);

 useEffect(() => {
  if (!createState.loading && createState.data) {
    // reset form after success
    setForm({
      currency_id: '',
      network_id: '',
      contract_address: '',
      min_transaction_amount: '',
      max_transaction_amount: '',
      network_fee_estimate_aud: '',
      is_active: true,
    });

    dispatch(fetchCurrencyNetworks());
    dispatch(clearCreate());
    onClose();
  }
}, [createState.data, createState.loading, dispatch, onClose]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    if (!form.currency_id || !form.network_id) return;
    const payload = {
      currency_id: form.currency_id,
      network_id: form.network_id,
      contract_address: form.contract_address || null,
      min_transaction_amount: form.min_transaction_amount,
      max_transaction_amount: form.max_transaction_amount,
      network_fee_estimate_aud: form.network_fee_estimate_aud,
      is_active: form.is_active ? 1 : 0,
    };

    dispatch(createCurrencyNetwork(payload));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-[95%] max-w-2xl p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Currency & Network</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs text-gray-600">Currency</div>
              <select name="currency_id" value={form.currency_id} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1">
                <option value="">Select currency</option>
                {currencies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-xs text-gray-600">Network</div>
              <select name="network_id" value={form.network_id} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1">
                <option value="">Select network</option>
                {networks.map((n: any) => (
                  <option key={n.id} value={n.id}>{n.code} - {n.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs text-gray-600">Contract Address</div>
              <input name="contract_address" value={form.contract_address} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="block">
              <div className="text-xs text-gray-600">Network Fee (AUD)</div>
              <input name="network_fee_estimate_aud" value={form.network_fee_estimate_aud} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <div className="text-xs text-gray-600">Min Transaction</div>
              <input name="min_transaction_amount" value={form.min_transaction_amount} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="block">
              <div className="text-xs text-gray-600">Max Transaction</div>
              <input name="max_transaction_amount" value={form.max_transaction_amount} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange as any} />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={onClose} className="bg-gray-100 text-gray-700">Cancel</Button>
            <Button type="submit" className=" text-white" disabled={createState.loading}>{createState.loading ? 'Saving...' : 'Save'}</Button>
          </div>

          {createState.error && <div className="text-sm text-red-500">{createState.error}</div>}
        </form>
      </div>
    </div>
  );
}
