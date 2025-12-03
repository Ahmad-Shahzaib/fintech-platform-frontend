// components/AdminAllTopUps.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchAllTopUps, AdminAllTopUpsQuery } from '@/redux/thunk/adminAllTopUpsThunks';
import { fetchTopUpDetail } from '@/redux/thunk/adminTopUpDetailThunks';
import { completeTopUp, processTopUp, approveTopUp, rejectTopUp } from '@/redux/thunk/adminTopUpActionsThunks';
import { clearAdminAllTopUpsState } from '@/redux/slice/adminAllTopUpsSlice';
import TopUpDetailModal from './TopUpDetailModal';

const AdminAllTopUps: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.adminAllTopUps);
    const { actionLoading, actionError, actionSuccess } = useAppSelector((state) => state.adminTopUps);
    const [filters, setFilters] = useState<AdminAllTopUpsQuery>({ page: 1, status: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTopUpId, setSelectedTopUpId] = useState<number | null>(null);
    // Complete modal states
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [transactionHash, setTransactionHash] = useState('');
    const [actualCryptoSent, setActualCryptoSent] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [completeError, setCompleteError] = useState('');
    // Process modal states
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [processAdminNotes, setProcessAdminNotes] = useState('');
    const [processError, setProcessError] = useState('');
    const [actionDropdownOpenId, setActionDropdownOpenId] = useState<number | null>(null);

    const toggleActionDropdown = (id: number) => {
        setActionDropdownOpenId((prev) => (prev === id ? null : id));
    };

    const handleApprove = (id: number) => {
        dispatch(approveTopUp(id));
    };

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState('');

    const handleRejectClick = (id: number) => {
        setSelectedTopUpId(id);
        setShowRejectModal(true);
        setActionDropdownOpenId(null);
    };

    const handleRejectConfirm = () => {
        if (!rejectReason.trim()) {
            setRejectError('Please provide a rejection reason.');
            return;
        }

        if (selectedTopUpId) {
            dispatch(rejectTopUp({ topUpId: selectedTopUpId, reason: rejectReason }));
            setShowRejectModal(false);
            setRejectReason('');
            setRejectError('');
            setSelectedTopUpId(null);
        }
    };

    const handleRejectCancel = () => {
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedTopUpId(null);
    };

    useEffect(() => {
        dispatch(fetchAllTopUps(filters));

        return () => {
            dispatch(clearAdminAllTopUpsState());
        };
    }, [dispatch, filters]);

    const handleRefresh = () => {
        dispatch(fetchAllTopUps(filters));
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, status: e.target.value, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
    };

    const handleViewDetails = (topUpId: number) => {
        setSelectedTopUpId(topUpId);
        setIsModalOpen(true);
        dispatch(fetchTopUpDetail(topUpId));
    };

    const handleCompleteClick = (id: number) => {
        setSelectedTopUpId(id);
        setShowCompleteModal(true);
    };

    const handleProcessClick = (id: number) => {
        setSelectedTopUpId(id);
        setShowProcessModal(true);
    };

    const handleCompleteConfirm = () => {
        if (!transactionHash.trim()) {
            setCompleteError('Please provide a transaction hash.');
            return;
        }
        const amount = parseFloat(actualCryptoSent as string);
        if (Number.isNaN(amount) || amount <= 0) {
            setCompleteError('Please provide a valid amount sent.');
            return;
        }

        if (selectedTopUpId) {
            dispatch(
                completeTopUp({
                    topUpId: selectedTopUpId,
                    transaction_hash: transactionHash.trim(),
                    actual_crypto_sent: amount,
                    admin_notes: adminNotes.trim() || undefined,
                })
            );

            setShowCompleteModal(false);
            setTransactionHash('');
            setActualCryptoSent('');
            setAdminNotes('');
            setCompleteError('');
            setSelectedTopUpId(null);
        }
    };

    const handleCompleteCancel = () => {
        setShowCompleteModal(false);
        setTransactionHash('');
        setActualCryptoSent('');
        setAdminNotes('');
        setCompleteError('');
        setSelectedTopUpId(null);
    };

    const handleProcessConfirm = () => {
        if (selectedTopUpId) {
            dispatch(
                processTopUp({
                    topUpId: selectedTopUpId,
                    admin_notes: processAdminNotes.trim() || undefined,
                })
            );

            setShowProcessModal(false);
            setProcessAdminNotes('');
            setProcessError('');
            setSelectedTopUpId(null);
        }
    };

    const handleProcessCancel = () => {
        setShowProcessModal(false);
        setProcessAdminNotes('');
        setProcessError('');
        setSelectedTopUpId(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                    <div className="ml-auto pl-3">
                        <button
                            onClick={handleRefresh}
                            className="text-sm text-red-700 hover:text-red-900"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">All Top-Up Requests</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">View and manage all top-up requests</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <div>
                            <label htmlFor="status-filter" className="sr-only">Status</label>
                            <select
                                id="status-filter"
                                name="status"
                                value={filters.status}
                                onChange={handleStatusFilterChange}
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {data && data.data && data.data.data && data.data.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Transaction ID
                                                </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    User
                                                </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Amount (AUD)
                                                </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Currency
                                                </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Network
                                                </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {data.data.data.map((topUp) => (
                                                <tr key={topUp.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                                        {topUp.transaction_id}
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 dark:text-gray-200">{topUp.user.name}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-300">{topUp.user.email}</div>
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            ${topUp.amount_aud}
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {topUp.currency.code}
                                                            </span>
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {topUp.network.name}
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(topUp.status)}`}>
                                                                {topUp.status.charAt(0).toUpperCase() + topUp.status.slice(1)}
                                                            </span>
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {new Date(topUp.created_at).toLocaleDateString()}
                                                    </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                            <button
                                                                onClick={() => toggleActionDropdown(topUp.id)}
                                                                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md"
                                                                aria-haspopup="true"
                                                            >
                                                                <span className="text-2xl">⋯</span>
                                                            </button>

                                                            {actionDropdownOpenId === topUp.id && (
                                                                <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-40">
                                                                    <button
                                                                        onClick={() => { handleViewDetails(topUp.id); setActionDropdownOpenId(null); }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { handleApprove(topUp.id); setActionDropdownOpenId(null); }}
                                                                        disabled={actionLoading}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50 disabled:opacity-50"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { handleRejectClick(topUp.id); }}
                                                                        disabled={actionLoading}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                     <button
                                                                        onClick={() => { handleProcessClick(topUp.id); setActionDropdownOpenId(null); }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50"
                                                                    >
                                                                        Process
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { handleCompleteClick(topUp.id); setActionDropdownOpenId(null); }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                                                                    >
                                                                        Complete
                                                                    </button>
                                                                   
                                                                    
                                                                </div>
                                                            )}
                                                        </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {data.data && (
                            <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(data.data.current_page - 1)}
                                        disabled={data.data.current_page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(data.data.current_page + 1)}
                                        disabled={data.data.current_page === data.data.last_page}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing <span className="font-medium">{data.data.from}</span> to <span className="font-medium">{data.data.to}</span> of{' '}
                                            <span className="font-medium">{data.data.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button
                                                onClick={() => handlePageChange(data.data.current_page - 1)}
                                                disabled={data.data.current_page === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>

                                            {Array.from({ length: data.data.last_page }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === data.data.current_page
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                onClick={() => handlePageChange(data.data.current_page + 1)}
                                                disabled={data.data.current_page === data.data.last_page}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No top-ups found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">There are no top-up requests matching your criteria.</p>
                        <div className="mt-6">
                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <TopUpDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                topUpId={selectedTopUpId}
            />

            {/* Complete Confirmation Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Complete Top-Up Request</h3>
                            <div className="mb-3">
                                <label htmlFor="transactionHash" className="block text-sm font-medium text-gray-700 mb-1">Transaction hash</label>
                                <input
                                    id="transactionHash"
                                    type="text"
                                    value={transactionHash}
                                    onChange={(e) => { setTransactionHash(e.target.value); if (completeError) setCompleteError(''); }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                    placeholder="0x..."
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="actualCryptoSent" className="block text-sm font-medium text-gray-700 mb-1">Actual crypto sent</label>
                                <input
                                    id="actualCryptoSent"
                                    type="number"
                                    step="0.0001"
                                    value={actualCryptoSent}
                                    onChange={(e) => { setActualCryptoSent(e.target.value); if (completeError) setCompleteError(''); }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                    placeholder="Amount sent"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-1">Admin notes (optional)</label>
                                <textarea
                                    id="adminNotes"
                                    rows={3}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                    placeholder="Notes..."
                                />
                            </div>
                            {completeError && (
                                <p className="text-sm text-red-600 mb-4">{completeError}</p>
                            )}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCompleteCancel}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCompleteConfirm}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Confirmation Modal */}
            {showProcessModal && (
                <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Start Processing Top-Up</h3>
                            <div className="mb-4">
                                <label htmlFor="processAdminNotes" className="block text-sm font-medium text-gray-700 mb-1">Admin notes (optional)</label>
                                <textarea
                                    id="processAdminNotes"
                                    rows={4}
                                    value={processAdminNotes}
                                    onChange={(e) => { setProcessAdminNotes(e.target.value); if (processError) setProcessError(''); }}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                    placeholder="Notes about starting processing..."
                                />
                            </div>
                            {processError && (
                                <p className="text-sm text-red-600 mb-4">{processError}</p>
                            )}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleProcessCancel}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProcessConfirm}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Start Processing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Reject Confirmation Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Top-Up Request</h3>
                            <div className="mb-4">
                                <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for rejection (optional)
                                </label>
                                <textarea
                                    id="rejectReason"
                                    rows={3}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectReason}
                                    onChange={(e) => { setRejectReason(e.target.value); if (rejectError) setRejectError(''); }}
                                />
                            </div>
                            {rejectError && (
                                <p className="text-sm text-red-600 mb-4">{rejectError}</p>
                            )}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleRejectCancel}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRejectConfirm}
                                    disabled={actionLoading || !rejectReason.trim()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Rejecting...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminAllTopUps;