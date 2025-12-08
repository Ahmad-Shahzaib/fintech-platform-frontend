"use client";
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPaypalDetails } from '@/redux/slice/fetchPaypalDetailsThunk';
import { updatePaypalDetail } from '@/redux/slice/updatePaypalDetailThunk';
import { useAlert } from '@/components/common/GlobalAlert';

const PayPalDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, items = [] } = useAppSelector((s) => (s.paypalDetails as any) || { loading: false, items: [] });
  const { showAlert } = useAlert();

  // Local state for inline editing
  const [editingData, setEditingData] = useState<{ [key: number]: { account_name: string; paypal_email: string } }>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPaypalDetails(2));
  }, [dispatch]);

  // Initialize editing state when data loads
  useEffect(() => {
    if (items.length > 0) {
      const initial = items.reduce((acc: any, item: any) => {
        acc[item.id] = {
          account_name: item.account_name || '',
          paypal_email: item.paypal_email || '',
        };
        return acc;
      }, {});
      setEditingData(initial);
    }
  }, [items]);

  const handleInputChange = (id: number, field: 'account_name' | 'paypal_email', value: string) => {
    setEditingData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (item: any) => {
    const updated = editingData[item.id];
    if (!updated.account_name.trim() || !updated.paypal_email.trim()) {
      showAlert('Please fill both fields', 'error');
      return;
    }

    setUpdatingId(item.id);
    try {
      await dispatch(
        updatePaypalDetail({
          id: item.id,
          account_name: updated.account_name,
          paypal_email: updated.paypal_email,
        } as any)
      ).unwrap();

      showAlert('PayPal detail updated successfully', 'success');
      // Refresh list
      dispatch(fetchPaypalDetails(2));
    } catch (err: any) {
      showAlert(err?.message || 'Failed to update', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          PayPal Details
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your PayPal account information below
        </p>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No PayPal details found</div>
        ) : (
          items.map((item: any) => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* Account Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={editingData[item.id]?.account_name || ''}
                    onChange={(e) => handleInputChange(item.id, 'account_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                {/* PayPal Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    value={editingData[item.id]?.paypal_email || ''}
                    onChange={(e) => handleInputChange(item.id, 'paypal_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example@paypal.com"
                  />
                </div>
              </div>

              {/* Update Button - Bottom Right */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleUpdate(item)}
                  disabled={updatingId === item.id}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm rounded-md shadow-sm transition-colors"
                >
                  {updatingId === item.id ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PayPalDetails;