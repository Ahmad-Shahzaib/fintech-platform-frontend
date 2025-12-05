"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchCurrencies } from '../../redux/thunk/currencyThunks';
import { fetchNetworks } from '../../redux/thunk/networkThunks';
import { fetchCurrencyNetworkDetail, updateCurrencyNetwork } from '../../redux/thunk/currencyNetworkThunks';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAlert } from '../common/GlobalAlert';
import { clear as clearCurrencyNetworkDetail } from '../../redux/slice/currencyNetworkSlice';
import { clearUpdate } from '../../redux/slice/currencyNetworkUpdateSlice';
import { fetchCurrencyNetworks } from '../../redux/slice/currencyNetworksSlice';
import { Button } from '../ui/button';

export default function UpdateCurrencyNetworkModal({ open, onClose, id }: { open: boolean; onClose: () => void; id: number | null }) {
  const dispatch = useAppDispatch();
  const currencies = useAppSelector((s) => (s as any).currencies?.items ?? []);
  const networks = useAppSelector((s) => (s as any).networks?.items ?? []);
  const detailState = useAppSelector((s) => (s as any).currencyNetworkDetail ?? { data: null, loading: false, error: null });
  const updateState = useAppSelector((s) => (s as any).currencyNetworkUpdate ?? { data: null, loading: false, error: null });
  const { showAlert } = useAlert();

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
    if (open && id != null) {
      dispatch(fetchCurrencyNetworkDetail(id));
    }
  }, [open, id, dispatch]);

  useEffect(() => {
    if (detailState.data) {
      const d = detailState.data as any;
      setForm({
        currency_id: String(d.currency_id ?? d.currency_id),
        network_id: String(d.network_id ?? d.network_id),
        contract_address: d.contract_address ?? '',
        min_transaction_amount: String(d.min_transaction_amount ?? ''),
        max_transaction_amount: String(d.max_transaction_amount ?? ''),
        network_fee_estimate_aud: String(d.network_fee_estimate_aud ?? ''),
        is_active: Boolean(d.is_active),
      });
    }
  }, [detailState.data]);

  useEffect(() => {
    if (!updateState.loading && updateState.data) {
      dispatch(fetchCurrencyNetworks());
      dispatch(clearUpdate());
      dispatch(clearCurrencyNetworkDetail());
      onClose();
    }
  }, [updateState.data, updateState.loading, dispatch, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const payload = {
      currency_id: form.currency_id,
      network_id: form.network_id,
      contract_address: form.contract_address || null,
      min_transaction_amount: form.min_transaction_amount,
      max_transaction_amount: form.max_transaction_amount,
      network_fee_estimate_aud: form.network_fee_estimate_aud,
      is_active: form.is_active ? 1 : 0,
    };

    try {
      const resultAction = await dispatch(updateCurrencyNetwork({ id, payload } as any));
      unwrapResult(resultAction);
      dispatch(fetchCurrencyNetworks());
      dispatch(clearUpdate());
      dispatch(clearCurrencyNetworkDetail());
      onClose();
      showAlert('Currency & Network updated successfully', 'success');
    } catch (err: any) {
      const msg = err?.payload || err?.message || 'Failed to update currency network';
      showAlert(typeof msg === 'string' ? msg : 'Failed to update currency network', 'error');
      console.error('Failed to update currency network', err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center">
      <div className="absolute inset-0 " onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[95%] max-w-2xl p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Currency & Network</h3>
          <button onClick={onClose} className="text-sm text-gray-500 dark:text-gray-300">Close</button>
        </div>

        {detailState.loading ? (
          <div className="py-6 text-center text-gray-600 dark:text-gray-300">Loading...</div>
        ) : detailState.error ? (
          <div className="py-6 text-center text-red-500 dark:text-red-400">{detailState.error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-xs text-gray-600 dark:text-gray-400">Currency</div>
                <select name="currency_id" value={form.currency_id} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600">
                  <option value="">Select currency</option>
                  {currencies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <div className="text-xs text-gray-600 dark:text-gray-400">Network</div>
                <select name="network_id" value={form.network_id} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600">
                  <option value="">Select network</option>
                  {networks.map((n: any) => (
                    <option key={n.id} value={n.id}>{n.code} - {n.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-xs text-gray-600 dark:text-gray-400">Contract Address</div>
                <input name="contract_address" value={form.contract_address} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
              </label>
              <label className="block">
                <div className="text-xs text-gray-600 dark:text-gray-400">Network Fee (AUD)</div>
                <input name="network_fee_estimate_aud" value={form.network_fee_estimate_aud} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <div className="text-xs text-gray-600 dark:text-gray-400">Min Transaction</div>
                <input name="min_transaction_amount" value={form.min_transaction_amount} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
              </label>
              <label className="block">
                <div className="text-xs text-gray-600 dark:text-gray-400">Max Transaction</div>
                <input name="max_transaction_amount" value={form.max_transaction_amount} onChange={handleChange} className="mt-1 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600" />
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange as any} />
                <span className="text-sm text-gray-900 dark:text-gray-200">Active</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={onClose} className="bg-gray-100 dark:bg-gray-700  text-gray-700 dark:text-gray-300">Cancel</Button>
              <Button type="submit" className="dark:bg-primary-600 text-white" disabled={updateState.loading}>{updateState.loading ? 'Saving...' : 'Save'}</Button>
            </div>

            {updateState.error && <div className="text-sm text-red-500">{updateState.error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
