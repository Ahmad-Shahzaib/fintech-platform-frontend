'use client';

import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

const TopUpsDashboard = () => {
    const [selectedTopUp, setSelectedTopUp] = useState(null);

    // Sample data
    const topUps = [
        {
            id: 'REQ-2024-001',
            date: '2024-03-15',
            amount: 500,
            coin: 'USDT',
            network: 'TRC20',
            status: 'completed',
            walletAddress: 'TXYZa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5',
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            adminNotes: null
        },
        {
            id: 'REQ-2024-002',
            date: '2024-03-18',
            amount: 1000,
            coin: 'USDC',
            network: 'ERC20',
            status: 'processing',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            transactionHash: null,
            adminNotes: null
        },
        {
            id: 'REQ-2024-003',
            date: '2024-03-20',
            amount: 250,
            coin: 'BTC',
            network: 'Bitcoin',
            status: 'pending',
            walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            transactionHash: null,
            adminNotes: null
        },
        {
            id: 'REQ-2024-004',
            date: '2024-03-12',
            amount: 750,
            coin: 'ETH',
            network: 'ERC20',
            status: 'rejected',
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            transactionHash: null,
            adminNotes: 'Invalid wallet address provided. Please verify and resubmit.'
        }
    ];

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Top-Ups</h1>
                    <p className="text-gray-600 mt-1">View and manage your cryptocurrency top-up requests</p>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Request ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Amount (AUD)
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Coin/Token
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Network
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {topUps.map((topUp) => (
                                    <tr key={topUp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {topUp.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(topUp.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ${topUp.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {topUp.coin}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {topUp.network}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(topUp.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setSelectedTopUp(topUp)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {topUps.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No top-up requests found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedTopUp && (
                <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Top-Up Details</h2>
                            <button
                                onClick={() => setSelectedTopUp(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Request ID
                                    </label>
                                    <p className="text-base font-semibold text-gray-900">{selectedTopUp.id}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Date Submitted
                                    </label>
                                    <p className="text-base text-gray-900">{formatDate(selectedTopUp.date)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Amount (AUD)
                                    </label>
                                    <p className="text-base font-semibold text-gray-900">
                                        ${selectedTopUp.amount.toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Coin & Network
                                    </label>
                                    <p className="text-base text-gray-900">
                                        {selectedTopUp.coin} <span className="text-gray-500">({selectedTopUp.network})</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Wallet Address
                                </label>
                                <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                                    <p className="text-sm font-mono text-gray-900 break-all">
                                        {selectedTopUp.walletAddress}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                    Status
                                </label>
                                <div className="mt-2">
                                    {getStatusBadge(selectedTopUp.status)}
                                </div>
                            </div>

                            {selectedTopUp.transactionHash && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Transaction Hash
                                    </label>
                                    <div className="bg-gray-50 rounded-md p-3 border border-gray-200 flex items-center justify-between">
                                        <p className="text-sm font-mono text-gray-900 break-all mr-2">
                                            {selectedTopUp.transactionHash}
                                        </p>
                                        <button className="text-blue-600 hover:text-blue-800 flex-shrink-0">
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedTopUp.adminNotes && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <label className="block text-sm font-medium text-red-800 mb-2">
                                        Admin Notes
                                    </label>
                                    <p className="text-sm text-red-700">{selectedTopUp.adminNotes}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                            <button
                                onClick={() => setSelectedTopUp(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopUpsDashboard;