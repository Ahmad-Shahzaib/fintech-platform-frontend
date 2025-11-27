"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { Button } from '../ui/button';
import { fetchCurrencyDetail } from '@/redux/thunk/currencyThunks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id?: number | null;
}

const CurrencyDetailModal: React.FC<Props> = ({ isOpen, onClose, id = null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { current, detailLoading, detailError } = useSelector((state: RootState) => state.currencies);

  useEffect(() => {
    if (isOpen && id != null) {
      dispatch(fetchCurrencyDetail(id));
    }
  }, [isOpen, id, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Currency Details</h2>
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
                <div className="text-sm text-gray-500">Symbol</div>
                <div className="font-medium">{current.symbol}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Decimals</div>
                <div className="font-medium">{current.decimals}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Description</div>
                <div className="font-medium">{current.description}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Min Amount</div>
                <div className="font-medium">{current.min_amount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Max Amount</div>
                <div className="font-medium">{current.max_amount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Active</div>
                <div className="font-medium">{current.is_active ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sort Order</div>
                <div className="font-medium">{current.sort_order}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">Icon</div>
                {current.icon_url ? (
                  <img src={current.icon_url} alt={current.name} className="h-12 w-12 object-contain" />
                ) : (
                  <div className="text-sm text-gray-500">No icon</div>
                )}
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

export default CurrencyDetailModal;
