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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Network Details</h2>
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</Button>
        </div>

        {detailLoading ? (
          <div>Loading...</div>
        ) : detailError ? (
          <div className="text-red-600">{detailError}</div>
        ) : current ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Code</div>
                <div className="font-medium">{current.code}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{current.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Full Name</div>
                <div className="font-medium">{current.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Chain ID</div>
                <div className="font-medium">{current.chain_id}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Description</div>
                <div className="font-medium">{current.description}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Avg Fee (AUD)</div>
                <div className="font-medium">{current.avg_transaction_fee_aud}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Avg Confirm Time (min)</div>
                <div className="font-medium">{current.avg_confirmation_time_minutes}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Active</div>
                <div className="font-medium">{current.is_active ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Requires Checksum</div>
                <div className="font-medium">{current.requires_checksum ? 'Yes' : 'No'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">RPC URL</div>
                <div className="font-medium">{current.rpc_url}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Explorer URL</div>
                <div className="font-medium">{current.explorer_url}</div>
              </div>
            </div>
          </div>
        ) : (
          <div>No data</div>
        )}
      </div>
    </div>
  );
};

export default NetworkDetailModal;
