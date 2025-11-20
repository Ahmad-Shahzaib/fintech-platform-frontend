"use client";
import { useState, useEffect } from 'react';


export default function TopUpRequest() {
  const [formData, setFormData] = useState({
    amount: '',
    coin: 'BTC',
    network: 'Bitcoin',
    walletAddress: '',
    confirmAddress: '',
    acceptDisclaimer: false
  });

  const [fees, setFees] = useState({
    networkFee: 0,
    exchangeFee: 0,
    totalReceive: 0
  });

  const coins = {
    BTC: { name: 'Bitcoin', networks: ['Bitcoin', 'Lightning Network'], icon: '₿' },
    ETH: { name: 'Ethereum', networks: ['Ethereum', 'Arbitrum', 'Optimism'], icon: 'Ξ' },
    USDC: { name: 'USD Coin', networks: ['Ethereum', 'Polygon', 'BSC', 'Solana'], icon: '$' },
    USDT: { name: 'Tether', networks: ['Ethereum', 'Tron', 'BSC', 'Polygon'], icon: '₮' },
    BNB: { name: 'BNB', networks: ['BSC', 'Ethereum'], icon: 'B' },
  };

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
  };

  useEffect(() => {
    if (formData.amount && formData.coin) {
      const amount = parseFloat(formData.amount);
      const networkFee = networkFees[formData.network] || 0;
      const exchangeRate = formData.coin === 'USDC' || formData.coin === 'USDT' ? 1 :
        formData.coin === 'BTC' ? 45000 :
          formData.coin === 'ETH' ? 2500 : 300;

      const exchangeFeePercent = 0.015;
      const exchangeFee = amount * exchangeFeePercent;
      const amountAfterFees = amount - exchangeFee;
      const cryptoAmount = amountAfterFees / exchangeRate;
      const totalReceive = cryptoAmount - networkFee;

      setFees({
        networkFee: networkFee,
        exchangeFee: exchangeFee.toFixed(2),
        totalReceive: totalReceive > 0 ? totalReceive.toFixed(8) : 0
      });
    }
  }, [formData.amount, formData.coin, formData.network]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCoinChange = (e) => {
    const coin = e.target.value;
    setFormData(prev => ({
      ...prev,
      coin: coin,
      network: coins[coin].networks[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.walletAddress !== formData.confirmAddress) {
      alert('Wallet addresses do not match!');
      return;
    }
    console.log('Form submitted:', formData);
    alert('Top-up request submitted successfully!');
  };

  const addressesMatch = formData.walletAddress && formData.confirmAddress &&
    formData.walletAddress === formData.confirmAddress;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">FinTech</span>
              <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Top-Up</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              View History
            </button>
            <button className="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
              Help & Support
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">New Top-Up Request</h2>
            <p className="text-sm text-gray-500 mb-8">Fill in the details below to request a crypto top-up to your wallet</p>

            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Amount (AUD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="500"
                    min="10"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Minimum top-up: $10 AUD</p>
              </div>

              {/* Coin Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Coin/Token <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="coin"
                      value={formData.coin}
                      onChange={handleCoinChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {Object.entries(coins).map(([key, coin]) => (
                        <option key={key} value={key}>
                          {coin.icon} {key} - {coin.name}
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

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Network <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="network"
                      value={formData.network}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {coins[formData.coin].networks.map((network) => (
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
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Wallet/Exchange Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  placeholder="Enter your wallet address"
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>

              {/* Confirm Wallet Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Confirm Wallet Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="confirmAddress"
                    value={formData.confirmAddress}
                    onChange={handleInputChange}
                    placeholder="Re-enter your wallet address"
                    className={`w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:ring-2 transition-all font-mono ${formData.confirmAddress && !addressesMatch ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-blue-500'
                      }`}
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
                {formData.confirmAddress && !addressesMatch && (
                  <p className="text-xs text-red-500 mt-2">Wallet addresses do not match</p>
                )}
              </div>

              {/* Fee Display Section */}
              {formData.amount && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Transaction Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Amount (AUD)</span>
                      <span className="text-sm font-semibold text-gray-900">${formData.amount}</span>
                    </div>
                    <div className="border-t border-blue-100"></div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Exchange Fee (1.5%)</span>
                      <span className="text-sm text-gray-900">-${fees.exchangeFee}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Network Fee</span>
                      <span className="text-sm text-gray-900">~{fees.networkFee} {formData.coin}</span>
                    </div>
                    <div className="border-t border-blue-200"></div>
                    <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3 py-3">
                      <span className="text-sm font-semibold text-gray-900">You'll Receive</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600">{fees.totalReceive} {formData.coin}</span>
                        <p className="text-xs text-gray-500 mt-0.5">≈ ${(parseFloat(formData.amount) - fees.exchangeFee).toFixed(2)} AUD</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptDisclaimer"
                    checked={formData.acceptDisclaimer}
                    onChange={handleInputChange}
                    className="mt-0.5 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 flex-shrink-0"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">Important:</span> I understand that cryptocurrency transactions are <span className="font-semibold">irreversible</span>. I am responsible for providing the correct wallet address and network. Sending to an incorrect address will result in permanent loss of funds.
                  </label>
                </div>
              </div>

              {/* Warning Message */}
              <div className="flex items-start space-x-3 bg-red-50 rounded-xl p-4 border border-red-100">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-xs text-red-700">
                  <p className="font-semibold mb-1">Triple-check before submitting:</p>
                  <ul className="space-y-0.5 ml-4 list-disc">
                    <li>Wallet address is correct</li>
                    <li>Network matches your wallet</li>
                    <li>You have selected the right coin</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!formData.acceptDisclaimer || !addressesMatch || !formData.amount}
                className={`w-full py-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${formData.acceptDisclaimer && addressesMatch && formData.amount
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <span>Submit Top-Up Request</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}