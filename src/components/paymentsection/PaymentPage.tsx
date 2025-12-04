// pages/payment.js
"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { submitPaymentProof } from '@/redux/thunk/submitPaymentThunks';

export default function PaymentConfirmationPage() {
  const dispatch = useAppDispatch();
  const submitState = useAppSelector((s: any) => s.submitPayment);
  const topUpsState = useAppSelector((s: any) => s.topUps);

  // start empty; we'll auto-fill from URL or topUps state when available
  const [topupId, setTopupId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [bankType, setBankType] = useState('Commonwealth Bank');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('top_up_request_id', topupId);
    formData.append('amount_paid_aud', amountPaid);
    formData.append('payment_method', paymentMethod);
    formData.append('reference_number', referenceNumber);
    formData.append('payment_notes', paymentNotes);

    const file = fileRef.current?.files?.[0];
    if (file) {
      formData.append('receipt_file', file);
    }

    try {
      // use unwrap to throw on rejected action so we only clear on success
      // @ts-ignore - unwrap exists on the returned promise
      await dispatch(submitPaymentProof(formData)).unwrap();

      // Clear form fields after successful submit
      setTopupId('');
      setAmountPaid('');
      setPaymentMethod('');
      setReferenceNumber('');
      setPaymentNotes('');
      setBankType('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      // error handled in slice
    }
  };

  // Auto-fill from URL params or from topUps redux state when available
  useEffect(() => {
    // try URL params first (e.g. ?topup_id=123)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('topup_id') || params.get('topupId') || params.get('id');
      if (q) {
        setTopupId(q);
      }
    }

    // if we don't have a topup id yet, try to take from topUps state
    if (!topupId && topUpsState?.items && topUpsState.items.length > 0) {
      const first = topUpsState.items[0];
      if (first?.id) setTopupId(String(first.id));
      // intentionally do NOT pre-fill `amountPaid` — require user to enter it manually
      if (first?.currency) setPaymentNotes((p) => p || `Currency: ${first.currency}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topUpsState]);

  return (
    <div className="min-h-screen dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8">
          <div className=" mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Confirmation</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Please fill in your payment details to complete the transaction</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="bg-gradient-to-br from-white/50 dark:from-gray-800/60 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bank Transfer Payment</h2>
            </div>

            <div className="p-0 space-y-6">
              {/* Top-up Request ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                  Top-up Request ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topupId}
                    onChange={(e) => setTopupId(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Amount Paid AUD */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                  Amount Paid (AUD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</div>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
              </div>

              {/* Bank type (only when bank transfer) */}
              {paymentMethod === 'bank_transfer' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">Bank <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={bankType}
                      onChange={(e) => setBankType(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option>Commonwealth Bank</option>
                      <option>ANZ</option>
                      <option>Westpac</option>
                      <option>NAB</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                  Reference Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. REF123456789"
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">Payment Notes</label>
                <textarea
                  rows={4}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Add any additional notes (optional)"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* Receipt File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">Receipt / Proof of Payment <span className="text-red-500">*</span></label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg hover:border-gray-400 transition bg-white dark:bg-gray-800">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m-4 4l8 8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-3 py-1">
                        <span>Upload receipt</span>
                        <input ref={fileRef} type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <div className="flex items-center justify-center mt-3 text-sm text-gray-500">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{fileRef.current?.files?.[0]?.name || 'No file selected'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitState?.loading}
                  className={`w-full py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${!submitState?.loading ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                  <span>{submitState?.loading ? 'Submitting...' : 'Submit Payment Confirmation'}</span>
                </button>
              </div>

              {/* Result / Help Text */}
              <div className="text-center text-sm text-gray-500">
                {submitState?.error && <p className="text-red-600">{submitState.error}</p>}
                {submitState?.success && <p className="text-green-600">Payment proof submitted successfully.</p>}
                <p className="mt-1">Our team will verify your payment within 24 hours.</p>
                <p className="mt-1">You will receive a confirmation email once approved.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}