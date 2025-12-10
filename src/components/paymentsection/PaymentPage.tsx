// pages/payment.js
"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { submitPaymentProof } from '@/redux/thunk/submitPaymentThunks';
import { fetchTopUps } from '@/redux/thunk/topUpsThunks';
import { fetchPaymentMethods } from '@/redux/thunk/paymentMethodsThunks';
import { fetchBankDetails } from '@/redux/slice/fetchBankDetailsThunk';
import { fetchPaypalDetails } from '@/redux/slice/fetchPaypalDetailsThunk';
import { useAlert } from '@/components/common/GlobalAlert';
import { resetSubmitPayment } from '@/redux/slice/submitPaymentSlice';

export default function PaymentConfirmationPage() {
  const dispatch = useAppDispatch();
  const submitState = useAppSelector((s: any) => s.submitPayment);
  const topUpsState = useAppSelector((s: any) => s.topUps);

  // start empty; we'll auto-fill from URL or topUps state when available
  const [topupId, setTopupId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [bankType, setBankType] = useState('Commonwealth Bank');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedPaypalIndex, setSelectedPaypalIndex] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Global alert from provider (replaces inline messages below)
  const { showAlert } = useAlert();

  // Show global alerts when submit state changes, then clear submit state after 3s
  useEffect(() => {
    let timer: number | undefined;
    if (submitState?.error) {
      const msg = typeof submitState.error === 'string' ? submitState.error : (submitState.error?.message ?? 'Failed to submit payment.');
      showAlert(String(msg), 'error');
      if (typeof window !== 'undefined') timer = window.setTimeout(() => dispatch(resetSubmitPayment()), 3000);
    } else if (submitState?.success) {
      showAlert('Payment proof submitted successfully.', 'success');
      if (typeof window !== 'undefined') timer = window.setTimeout(() => dispatch(resetSubmitPayment()), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [submitState?.error, submitState?.success, showAlert, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!topupId || String(topupId).trim() === '') {
      // eslint-disable-next-line no-alert
      alert('Top-up request ID is required');
      return;
    }

    if (!amountPaid || String(amountPaid).trim() === '') {
      // eslint-disable-next-line no-alert
      alert('Payment amount is required');
      return;
    }

    const selectedMethodObj = paymentMethodsState?.methods?.find((m: any) => String(m.id) === String(paymentMethod));
    const methodName = String(selectedMethodObj?.name || '').toLowerCase();

    if (methodName.includes('bank') && !selectedBankId) {
      // eslint-disable-next-line no-alert
      alert('Please select a bank for bank transfer payments');
      return;
    }

    // Resolve topup identifier: if user provided a transaction id, map to internal id
    let submitTopupId = topupId;
    const matched = (topUpsState?.items || []).find((it: any) => String(it.id) === String(topupId) || String(it.transaction_id ?? '') === String(topupId));
    if (matched) submitTopupId = String(matched.id);

    const formData = new FormData();
    formData.append('top_up_request_id', submitTopupId);
    formData.append('amount_paid_aud', amountPaid);
    formData.append('payment_method', paymentMethod);
    formData.append('reference_number', referenceNumber);
    formData.append('payment_notes', paymentNotes);

    const file = fileRef.current?.files?.[0];
    if (file) {
      formData.append('receipt_file', file);
    }

    // if a bank was selected, include bank_id in the payload
    if (selectedBankId) {
      formData.append('bank_id', selectedBankId);
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
      setSelectedBankId('');
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

  // Load available payment methods
  const paymentMethodsState = useAppSelector((s: any) => s.paymentMethods);
  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  // If methods arrive and no selection yet, pick the first active method
  useEffect(() => {
    if ((!paymentMethod || paymentMethod === '') && paymentMethodsState?.methods && paymentMethodsState.methods.length > 0) {
      const active = paymentMethodsState.methods.find((m: any) => Number(m?.is_active) === 1) || paymentMethodsState.methods[0];
      if (active) setPaymentMethod(String(active.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethodsState.methods]);

  // bank/paypal details state from redux
  const bankDetailsState = useAppSelector((s: any) => s.bankDetails || { loading: false, items: [] });
  const paypalDetailsState = useAppSelector((s: any) => s.paypalDetails || { loading: false, items: [] });

  // When payment method changes, fetch related payment details (bank or paypal)
  useEffect(() => {
    if (!paymentMethod) return;
    const methodObj = paymentMethodsState?.methods?.find((m: any) => String(m.id) === String(paymentMethod));
    const name = String(methodObj?.name || '').toLowerCase();
    // reset selections
    setSelectedBankId('');
    setSelectedPaypalIndex(0);

    if (name.includes('bank')) {
      // fetch details for this payment method id (fallback default is handled in thunk)
      dispatch(fetchBankDetails(Number(methodObj?.id || 1)));
    } else if (name.includes('paypal')) {
      dispatch(fetchPaypalDetails(Number(methodObj?.id || 2)));
    }
  }, [paymentMethod, paymentMethodsState.methods, dispatch]);

  // Ensure we have the user's completed top-ups available for the dropdown
  useEffect(() => {
    // request completed top-ups from server (status filter)
    dispatch(fetchTopUps({ status: 'completed', page: 1 }));
  }, [dispatch]);

  // derive list of completed top-ups from redux state
  const completedTopUps = (topUpsState?.items || []).filter((t: any) => String(t?.status || '').toLowerCase() === 'completed');

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
                 My Active Top-ups<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {completedTopUps && completedTopUps.length > 0 ? (
                    <select
                      value={topupId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTopupId(val);
                        const sel = completedTopUps.find((it: any) => String(it.id) === val || String(it.transaction_id ?? '') === val);
                        if (sel) {
                          const amt = sel.amount_aud ?? sel.total_aud ?? sel.amount ?? '';
                          const n = parseFloat(String(amt));
                          setAmountPaid(!isNaN(n) ? String(n.toFixed(2)) : String(amt));
                        }
                      }}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select completed top-up</option>
                      {completedTopUps.map((item: any) => {
                        const txn = item.transaction_id ?? item.id;
                        const amt = item.amount_aud ?? item.total_aud ?? item.amount ?? '';
                        const n = parseFloat(String(amt));
                        const amtFormatted = !isNaN(n) ? n.toFixed(2) : String(amt);
                        return (
                          <option key={String(item.id)} value={String(item.id)}>
                            {`${String(txn)} ($${amtFormatted})`}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={topupId}
                      onChange={(e) => setTopupId(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  )}
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
                    {paymentMethodsState?.loading && <option>Loading methods...</option>}
                    {!paymentMethodsState?.loading && paymentMethodsState?.methods && paymentMethodsState.methods.length === 0 && (
                      <option value="">No payment methods available</option>
                    )}
                    {paymentMethodsState?.methods?.filter((m: any) => Number(m?.is_active) === 1).map((m: any) => (
                      <option key={String(m.id)} value={String(m.id)}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bank type (only when bank transfer) */}
              {(() => {
                const selectedMethod = paymentMethodsState?.methods?.find((m: any) => String(m.id) === String(paymentMethod));
                return selectedMethod && String(selectedMethod.name).toLowerCase().includes('bank') ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">Bank <span className="text-red-500">*</span></label>
                    <div className="relative">
                      {/* If bank details are available from server, show dynamic list */}
                      {bankDetailsState?.items && bankDetailsState.items.length > 0 ? (
                        <>
                          <select
                            value={selectedBankId || ''}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                          >
                            <option value="">Select bank</option>
                            {bankDetailsState.items.map((b: any) => (
                              <option key={String(b.id)} value={String(b.id)}>{b.bank_name || b.account_title || `Bank ${b.id}`}</option>
                            ))}
                          </select>

                          {/* small card preview for selected bank */}
                          {selectedBankId && (
                            (() => {
                              const bank = bankDetailsState.items.find((x: any) => String(x.id) === String(selectedBankId));
                              if (!bank) return null;
                              return (
                                <div className="mt-3 p-3 border rounded-lg bg-yellow-100 dark:bg-gray-900">
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{bank.bank_name || 'Bank'}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Account Title: {bank.account_title || '-'}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Account Number: {bank.account_number || '-'}</div>
                                  {bank.iban && <div className="text-xs text-gray-600 dark:text-gray-300">IBAN: {bank.iban}</div>}
                                  {bank.swift_code && <div className="text-xs text-gray-600 dark:text-gray-300">SWIFT: {bank.swift_code}</div>}
                                </div>
                              );
                            })()
                          )}
                        </>
                      ) : (
                        <select
                          value={bankType}
                          onChange={(e) => setBankType(e.target.value)}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                           
                        </select>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* PayPal details (only when paypal method selected) */}
              {(() => {
                const selectedMethod = paymentMethodsState?.methods?.find((m: any) => String(m.id) === String(paymentMethod));
                if (!selectedMethod) return null;
                if (String(selectedMethod.name).toLowerCase().includes('paypal')) {
                  return (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">PayPal Account</label>
                      <div className="relative">
                        {paypalDetailsState?.items && paypalDetailsState.items.length > 0 ? (
                          <>
                            
                            {/* small card preview for selected paypal */}
                            {paypalDetailsState.items[selectedPaypalIndex] && (
                              <div className="mt-3 p-3 border rounded-lg bg-yellow-100 dark:bg-gray-900">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">Name:  {paypalDetailsState.items[selectedPaypalIndex].account_name || 'PayPal'}</div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">Email: {paypalDetailsState.items[selectedPaypalIndex].paypal_email || '-'}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">No PayPal details available</div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

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

              {/* Result / Help Text (global alerts used for errors/success) */}
              <div className="text-center text-sm text-gray-500">
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