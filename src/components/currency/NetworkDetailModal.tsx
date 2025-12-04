"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { Button } from '../ui/button';
import { fetchNetworkById } from '@/redux/thunk/networkThunks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id?: number | null;
}

const NetworkDetailModal: React.FC<Props> = ({ isOpen, onClose, id = null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { current, detailLoading, detailError } = useSelector((state: RootState) => (state.networks as any));

  useEffect(() => {
    if (isOpen && id != null) {
      dispatch(fetchNetworkById(id));
    }
  }, [isOpen, id, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center ">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Network Details</h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">Close</Button>
        </div>

        {detailLoading ? (
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        ) : detailError ? (
          <div className="text-red-600 dark:text-red-400">{detailError}</div>
        ) : current ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Code</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.code}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Full Name</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Chain ID</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.chain_id}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.description}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Fee (AUD)</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.avg_transaction_fee_aud}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Confirm Time (min)</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.avg_confirmation_time_minutes}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.is_active ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Requires Checksum</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.requires_checksum ? 'Yes' : 'No'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">RPC URL</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.rpc_url}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500 dark:text-gray-400">Explorer URL</div>
                <div className="font-medium text-gray-900 dark:text-white">{current.explorer_url}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 dark:text-gray-300">No data</div>
        )}
      </div>
    </div>
  );
};

export default NetworkDetailModal;
