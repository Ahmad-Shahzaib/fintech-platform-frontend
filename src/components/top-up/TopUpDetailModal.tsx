import React from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAdminTopUpDetailState } from '@/redux/slice/adminTopUpDetailSlice';

interface TopUpDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    topUpId: number | null;
}

const TopUpDetailModal: React.FC<TopUpDetailModalProps> = ({ isOpen, onClose, topUpId }) => {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.adminTopUpDetail);

    const handleClose = () => {
        dispatch(clearAdminTopUpDetailState());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0  bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] top-5 overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center pb-3">
                        <h3 className="text-xl font-semibold text-gray-900">Top-Up Details</h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {error && (
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
                            </div>
                        </div>
                    )}

                    {data && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Transaction Information</h4>
                                    <dl className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                                            <dd className="text-sm text-gray-900">{data.transaction_id}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                                            <dd className="text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    data.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        data.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            data.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                                data.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Amount (AUD)</dt>
                                            <dd className="text-sm text-gray-900">${data.amount_aud}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Platform Fee (AUD)</dt>
                                            <dd className="text-sm text-gray-900">${data.platform_fee_aud}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Network Fee (AUD)</dt>
                                            <dd className="text-sm text-gray-900">${data.network_fee_aud}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Total (AUD)</dt>
                                            <dd className="text-sm text-gray-900">${data.total_aud}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                            <dd className="text-sm text-gray-900">{new Date(data.created_at).toLocaleString()}</dd>
                                        </div>
                                        {data.approved_at && (
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-500">Approved At</dt>
                                                <dd className="text-sm text-gray-900">{new Date(data.approved_at).toLocaleString()}</dd>
                                            </div>
                                        )}
                                        {data.completed_at && (
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-500">Completed At</dt>
                                                <dd className="text-sm text-gray-900">{new Date(data.completed_at).toLocaleString()}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">User Information</h4>
                                    <dl className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                                            <dd className="text-sm text-gray-900">{data.user.name}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{data.user.email}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                            <dd className="text-sm text-gray-900">{data.user.phone}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Transaction Limit</dt>
                                            <dd className="text-sm text-gray-900">${data.user.transaction_limit}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Total Borrowed</dt>
                                            <dd className="text-sm text-gray-900">${data.user.total_borrowed}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Total Repaid</dt>
                                            <dd className="text-sm text-gray-900">${data.user.total_repaid}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Completed Transactions</dt>
                                            <dd className="text-sm text-gray-900">{data.user.completed_transactions}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                                            <dd className="text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {data.user.status.charAt(0).toUpperCase() + data.user.status.slice(1)}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Currency & Network</h4>
                                    <dl className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Currency</dt>
                                            <dd className="text-sm text-gray-900">{data.currency.name} ({data.currency.code})</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Network</dt>
                                            <dd className="text-sm text-gray-900">{data.network.full_name}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                                            <dd className="text-sm text-gray-900 break-all">{data.wallet_address}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Address Validated</dt>
                                            <dd className="text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.address_validated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {data.address_validated ? 'Yes' : 'No'}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Checksum Validated</dt>
                                            <dd className="text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.checksum_validated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {data.checksum_validated ? 'Yes' : 'No'}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Repayment Information</h4>
                                    <dl className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Repayment Amount (AUD)</dt>
                                            <dd className="text-sm text-gray-900">${data.repayment_amount_aud}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Repayment Due Date</dt>
                                            <dd className="text-sm text-gray-900">{new Date(data.repayment_due_date).toLocaleDateString()}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Repayment Status</dt>
                                            <dd className="text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.repayment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    data.repayment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {data.repayment_status.charAt(0).toUpperCase() + data.repayment_status.slice(1)}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {data.admin_notes && (
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Admin Notes</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">{data.admin_notes}</p>
                                    </div>
                                </div>
                            )}

                            {data.approver && (
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Approver Information</h4>
                                    <dl className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                                            <dd className="text-sm text-gray-900">{data.approver.name}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{data.approver.email}</dd>
                                        </div>
                                    </dl>
                                </div>
                            )}

                            {data.processor && (
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Processor Information</h4>
                                    <dl className="bg-gray-50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                                            <dd className="text-sm text-gray-900">{data.processor.name}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="text-sm text-gray-900">{data.processor.email}</dd>
                                        </div>
                                    </dl>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopUpDetailModal;