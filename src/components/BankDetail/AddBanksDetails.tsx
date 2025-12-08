"use client";

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addBankDetail } from '@/redux/slice/bankDetailsThunk';
import { fetchBankDetails } from '@/redux/slice/fetchBankDetailsThunk';
import { updateBankDetail } from '@/redux/slice/updateBankDetailThunk';
import { deleteBankDetail } from '@/redux/slice/deleteBankDetailThunk';
import { useAlert } from '@/components/common/GlobalAlert';

interface BankDetail {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
}

const AddBanksDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, items = [] } = useAppSelector((s) => s.bankDetails || { loading: false, items: [] });
  const { showAlert } = useAlert();

  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionDropdownOpenId, setActionDropdownOpenId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<BankDetail>({
    bank_name: '',
    account_title: '',
    account_number: '',
    iban: '',
    swift_code: '',
  });

  // items will be loaded from server

  const openModal = () => {
    // reset form to empty when opening
    setEditingId(null);
    setForm({ bank_name: '', account_title: '', account_number: '', iban: '', swift_code: '' });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // clear form when closing
    setForm({ bank_name: '', account_title: '', account_number: '', iban: '', swift_code: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  React.useEffect(() => {
    dispatch(fetchBankDetails(1));
  }, [dispatch]);

  // Close action dropdown when clicking outside (matches users table behaviour)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionDropdownOpenId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          setActionDropdownOpenId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionDropdownOpenId]);

  const handleSubmit = async () => {
    // simple validation
    if (!form.bank_name.trim() || !form.account_title.trim() || !form.account_number.trim()) {
      showAlert('Please fill required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await dispatch(updateBankDetail({ id: editingId, ...form } as any)).unwrap();
        const msg = res?.message || 'Bank detail updated';
        showAlert(msg, 'success');
        setEditingId(null);
      } else {
        const res = await dispatch(addBankDetail(form as any)).unwrap();
        const msg = res?.message || 'Bank detail added';
        showAlert(msg, 'success');
      }
      // refresh list from server
      try { await dispatch(fetchBankDetails(1)).unwrap(); } catch (e) { /* ignore */ }
      closeModal();
    } catch (err: any) {
      const message = typeof err === 'string' ? err : err?.message || 'Failed to add bank detail';
      showAlert(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (b: any) => {
    setEditingId(b.id);
    setForm({ bank_name: b.bank_name || '', account_title: b.account_title || '', account_number: b.account_number || '', iban: b.iban || '', swift_code: b.swift_code || '' });
    setIsOpen(true);
    setActionDropdownOpenId(null);
  };

  const handleDeleteConfirm = async (id: number) => {
    setConfirmDeleteId(null);
    try {
      const res = await dispatch(deleteBankDetail(id as any)).unwrap();
      const msg = res?.data?.message || 'Deleted successfully';
      showAlert(msg, 'success');
      try { await dispatch(fetchBankDetails(1)).unwrap(); } catch (e) { /* ignore */ }
    } catch (err: any) {
      const message = typeof err === 'string' ? err : err?.message || 'Failed to delete';
      showAlert(message, 'error');
    }
  };

  const toggleActionDropdown = (id: number) => {
    setActionDropdownOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex items-start justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Bank Details</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Manage user's bank account details</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={openModal}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New Bank 
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-4 pb-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IBAN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SWIFT</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items && items.length > 0 ? (
                items.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{b.bank_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{b.account_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{b.account_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{b.iban || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{b.swift_code || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="relative inline-block text-left dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionDropdownOpenId((prev) => (prev === b.id ? null : b.id));
                          }}
                          className="inline-flex justify-center w-full rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                        {actionDropdownOpenId === b.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20 py-1">
                            <button
                              onClick={() => {
                                handleOpenEdit(b);
                                setActionDropdownOpenId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path d="M2.05 12C3.43 7.36 7.4 4 12 4s8.57 3.36 9.95 8c-1.38 4.64-5.35 8-9.95 8S3.43 16.64 2.05 12z" />
                              </svg>
                              Update
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(b.id);
                                setActionDropdownOpenId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-300">No bank details found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100000] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Bank Detail</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Bank Name</label>
                  <input name="bank_name" value={form.bank_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Account Title</label>
                  <input name="account_title" value={form.account_title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Account Number</label>
                  <input name="account_number" value={form.account_number} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">IBAN</label>
                  <input name="iban" value={form.iban} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">SWIFT</label>
                  <input name="swift_code" value={form.swift_code} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
              </div>

                <div className="mt-6 flex justify-end space-x-3">
                <button onClick={closeModal} className="px-3 py-2 rounded-md border border-gray-300">Cancel</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || loading}
                  className="px-3 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60"
                >
                  {submitting || loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-[110000] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete this bank detail?</p>
              <div className="mt-6 flex justify-end space-x-3">
                <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-2 rounded-md border border-gray-300">Cancel</button>
                <button onClick={() => handleDeleteConfirm(confirmDeleteId as number)} className="px-3 py-2 rounded-md bg-red-600 text-white">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBanksDetails;