"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import api from '../../lib/axios';
import { AxiosError } from 'axios';

const COINS = {
  BTC: { name: 'Bitcoin', networks: ['Bitcoin', 'Lightning Network'], icon: '₿' },
  ETH: { name: 'Ethereum', networks: ['Ethereum', 'Arbitrum', 'Optimism'], icon: 'Ξ' },
  USDC: { name: 'USD Coin', networks: ['Ethereum', 'Polygon', 'BSC', 'Solana'], icon: '$' },
  USDT: { name: 'Tether', networks: ['Ethereum', 'Tron', 'BSC', 'Polygon'], icon: '₮' },
  BNB: { name: 'BNB', networks: ['BSC', 'Ethereum'], icon: 'B' },
} as const;

const networkFees = {
  Bitcoin: 0.0005,
  'Lightning Network': 0.00001,
  Ethereum: 0.003,
  Polygon: 0.1,
  BSC: 0.0003,
  Arbitrum: 0.0002,
  Optimism: 0.0002,
  Tron: 1,
  Solana: 0.00025
} as const;


type FormData = {
  amount: string; // raw AUD string input
  coin: keyof typeof COINS;
  network: string;
  walletAddress: string;
  confirmAddress: string;
  acceptDisclaimer: boolean;
};

type FeeState = {
  networkFee: number; // coin units
  exchangeFee: number; // AUD
  cryptoAmount: number; // how much crypto after exchange before network fee
  totalReceive: number; // crypto units (after network fee)
};

export default function TopUpRequest() {
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    coin: 'BTC',
    network: 'Bitcoin',
    walletAddress: '',
    confirmAddress: '',
    acceptDisclaimer: false
  });

  const [fees, setFees] = useState<FeeState>({
    networkFee: 0,
    exchangeFee: 0,
    cryptoAmount: 0,
    totalReceive: 0
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);



  useEffect(() => {
    const validateAmount = (value: string) => {
      const num = parseFloat(value || '0');
      if (!value) return 'Amount is required';
      if (isNaN(num)) return 'Invalid number';
      if (num < 10) return 'Minimum top-up is $10 AUD';
      return undefined;
    };

    const amountError = validateAmount(formData.amount);
    setErrors(prev => ({ ...prev, amount: amountError }));

    const amount = parseFloat(formData.amount || '0');
    if (isNaN(amount) || amount <= 0) {
      setFees(prev => ({ ...prev, networkFee: 0, exchangeFee: 0, cryptoAmount: 0, totalReceive: 0 }));
      return;
    }

    const networkFee = networkFees[formData.network as keyof typeof networkFees] || 0;
    const exchangeRate = getExchangeRate(formData.coin as keyof typeof COINS);
    const exchangeFeePercent = 0.015; // 1.5%
    const exchangeFee = parseFloat((amount * exchangeFeePercent).toFixed(2));
    const amountAfterFees = Math.max(0, amount - exchangeFee);
    const cryptoAmount = amountAfterFees / exchangeRate; // coin units
    const totalReceive = Math.max(0, cryptoAmount - networkFee);

    setFees({
      networkFee,
      exchangeFee,
      cryptoAmount,
      totalReceive
    });
  }, [formData.amount, formData.coin, formData.network]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type, checked } = target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleCoinChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const coinKey = e.target.value as keyof typeof COINS;
    setFormData(prev => ({
      ...prev,
      coin: coinKey,
      network: COINS[coinKey].networks[0],
      walletAddress: '',
      confirmAddress: ''
    }));
    setErrors(prev => ({ ...prev, walletAddress: undefined, confirmAddress: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement> | FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Basic client-side validation
    const newErrors: Record<string, string | undefined> = {};
    const amountNum = parseFloat(formData.amount || '0');
    if (!formData.amount || isNaN(amountNum) || amountNum < 10) newErrors.amount = 'Please enter a valid amount (minimum $10 AUD)';
    const addressError = validateAddressForNetwork(formData.network, formData.walletAddress);
    if (addressError) newErrors.walletAddress = addressError;
    if (!formData.confirmAddress) newErrors.confirmAddress = 'Please confirm wallet address';
    if (formData.walletAddress !== formData.confirmAddress) newErrors.confirmAddress = 'Wallet addresses do not match';
    if (!formData.acceptDisclaimer) newErrors.acceptDisclaimer = 'You must accept the disclaimer to proceed';

    setErrors(prev => ({ ...prev, ...newErrors }));
    if (Object.keys(newErrors).length) return;

    setIsSubmitting(true);
    try {
      const payload = {
        amountAUD: amountNum,
        coin: formData.coin,
        network: formData.network,
        walletAddress: formData.walletAddress,
        fees: {
          exchangeFeeAUD: fees.exchangeFee,
          networkFee: fees.networkFee,
          totalReceiveCrypto: fees.totalReceive
        }
      };
      // If API client is configured, call the backend; otherwise just simulate a flow
      if (api) {
        await api.post('/top-ups', payload);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // success
      setIsSubmitting(false);
      // Persist to localStorage so it shows up in the dashboard
      try {
        const now = new Date();
        const newTopUp = {
          id: `REQ-${now.getFullYear()}-${now.getTime()}`,
          date: now.toISOString(),
          amount: amountNum,
          coin: formData.coin,
          network: formData.network,
          status: 'pending',
          walletAddress: formData.walletAddress,
          transactionHash: null,
          adminNotes: null
        };
        // Read existing items from localStorage
        const existing = JSON.parse(localStorage.getItem('topUps') || '[]');
        existing.unshift(newTopUp);
        localStorage.setItem('topUps', JSON.stringify(existing));
        // Inform any other components on the page
        try {
          window.dispatchEvent(new CustomEvent('topup:added', { detail: newTopUp }));
        } catch (e) {
          // ignore if CustomEvent is not supported in the env
        }
      } catch (err) {
        // ignore localstorage errors
        console.warn('Failed to persist top-up request in localStorage', err);
      }
      // Minimal UX: clear form and show success
      setFormData({ ...formData, amount: '', walletAddress: '', confirmAddress: '', acceptDisclaimer: false });
      setFees({ networkFee: 0, exchangeFee: 0, cryptoAmount: 0, totalReceive: 0 });
      setErrors({});
      alert('Top-up request submitted successfully!');
    } catch (error) {
      setIsSubmitting(false);
      const axiosError = error as AxiosError;
      const errorMessage = (axiosError?.response?.data as any)?.message || axiosError?.message || 'An error occurred while submitting your request';
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    }
  };

  const addressesMatch = formData.walletAddress && formData.confirmAddress &&
    formData.walletAddress === formData.confirmAddress;

  function formatAUD(value: number | string) {
    const num = typeof value === 'string' ? parseFloat(value || '0') : value || 0;
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2 }).format(num);
  }

  function formatCrypto(value: number, decimals = 8) {
    return value ? value.toFixed(decimals) : '0';
  }

  function getExchangeRate(coin: keyof typeof COINS) {
    // In a real app, this should come from an up-to-date exchange rate endpoint
    return coin === 'USDC' || coin === 'USDT' ? 1 : coin === 'BTC' ? 45000 : coin === 'ETH' ? 2500 : 300;
  }

  function validateAddressForNetwork(network: string, address: string) {
    if (!address) return 'Wallet address is required';
    const a = address.trim();
    if (network === 'Bitcoin') {
      if (!/^(bc1|[13])[A-HJ-NP-Za-km-z1-9]{25,39}$/.test(a)) return 'Invalid Bitcoin address';
    }
    if (network === 'Lightning Network') {
      if (a.length < 10) return 'Invalid Lightning address';
    }
    if (['Ethereum', 'Arbitrum', 'Optimism', 'Polygon', 'BSC', 'BNB'].includes(network)) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(a)) return 'Invalid EVM-style address (expect 0x...)';
    }
    if (network === 'Tron') {
      if (!/^T[a-zA-Z0-9]{33}$/.test(a)) return 'Invalid Tron address';
    }
    if (network === 'Solana') {
      if (!(a.length >= 32 && a.length <= 44)) return 'Invalid Solana address';
    }
    return undefined;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Form Content */}
        <div className="p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">New Top-Up Request</h2>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-8">Fill in the details below to request a crypto top-up to your wallet</p>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                  Amount (AUD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </div>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="500"
                    min="10"
                    step="0.01"
                    required
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
                    aria-invalid={!!errors.amount}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Minimum top-up: $10 AUD</p>
                {errors.amount && <p className="text-xs text-red-500 mt-2">{errors.amount}</p>}
              </div>

              {/* Coin Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="coin" className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                    Select Coin/Token <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      id="coin"
                      name="coin"
                      value={formData.coin}
                      onChange={handleCoinChange}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all appearance-none cursor-pointer"
                    >
                      {(Object.keys(COINS) as (keyof typeof COINS)[]).map((key) => {
                        const coin = COINS[key];
                        return (
                          <option key={String(key)} value={String(key)}>
                            {coin.icon} {String(key)} - {coin.name}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="network" className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                    Select Network <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      id="network"
                      name="network"
                      value={formData.network}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all appearance-none cursor-pointer"
                    >
                      {COINS[formData.coin as keyof typeof COINS].networks.map((network: string) => (
                        <option key={network} value={network}>
                          {network}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                  Wallet/Exchange Address <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  id="walletAddress"
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your wallet address"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all font-mono"
                  aria-invalid={!!errors.walletAddress}
                />
                {errors.walletAddress && <p className="text-xs text-red-500 mt-2">{errors.walletAddress}</p>}
              </div>

              {/* Confirm Wallet Address */}
              <div>
                <label htmlFor="confirmAddress" className="block text-sm font-semibold text-gray-900 mb-3 dark:text-white">
                  Confirm Wallet Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    id="confirmAddress"
                    type="text"
                    name="confirmAddress"
                    value={formData.confirmAddress}
                    onChange={handleInputChange}
                    placeholder="Re-enter your wallet address"
                    className={`w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 transition-all font-mono ${formData.confirmAddress && !addressesMatch ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-blue-500'
                      }`}
                    aria-invalid={!!errors.confirmAddress}
                  />
                  {formData.confirmAddress && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {addressesMatch ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {errors.confirmAddress && <p className="text-xs text-red-500 mt-2">{errors.confirmAddress}</p>}
              </div>

              {/* Fee Display Section */}
              {formData.amount && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-2xl p-6 border border-blue-100 dark:border-blue-900">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Transaction Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-white">Amount (AUD)</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatAUD(formData.amount)}</span>
                    </div>
                    <div className="border-t border-blue-100"></div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Exchange Fee (1.5%)</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">-${fees.exchangeFee}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Network Fee</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">~{formatCrypto(fees.networkFee)} {String(formData.coin)}</span>
                    </div>
                    <div className="border-t border-blue-200 dark:border-blue-900"></div>
                    <div className="flex justify-between items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">You'll Receive</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCrypto(fees.totalReceive)} {String(formData.coin)}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">≈ ${(parseFloat(formData.amount) - fees.exchangeFee).toFixed(2)} AUD</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900 rounded-xl p-5 border border-amber-200 dark:border-amber-700">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptDisclaimer"
                    checked={formData.acceptDisclaimer}
                    onChange={handleInputChange}
                    className="mt-0.5 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 flex-shrink-0"
                  />
                  <label className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-gray-900">Important:</span> I understand that cryptocurrency transactions are <span className="font-semibold">irreversible</span>. I am responsible for providing the correct wallet address and network. Sending to an incorrect address will result in permanent loss of funds.
                  </label>
                </div>
              </div>
              {errors.acceptDisclaimer && <p className="text-xs text-red-500 mt-2">{errors.acceptDisclaimer}</p>}

              {/* Warning Message */}
              <div className="flex items-start space-x-3 bg-red-50 dark:bg-red-900 rounded-xl p-4 border border-red-100 dark:border-red-700">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-xs text-red-700 dark:text-red-200">
                  <p className="font-semibold mb-1">Triple-check before submitting:</p>
                  <ul className="space-y-0.5 ml-4 list-disc">
                    <li>Wallet address is correct</li>
                    <li>Network matches your wallet</li>
                    <li>You have selected the right coin</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              {errors.submit && <p className="text-xs text-red-500 mb-2">{errors.submit}</p>}
              <button
                type="submit"
                disabled={!formData.acceptDisclaimer || !addressesMatch || !formData.amount || !!errors.amount || isSubmitting}
                className={`w-full py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${formData.acceptDisclaimer && addressesMatch && formData.amount
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-300 cursor-not-allowed'
                  }`}>
                <span>{isSubmitting ? 'Submitting…' : 'Submit Top-Up Request'}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}