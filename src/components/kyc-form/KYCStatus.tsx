"use client"

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchKycStatus } from '@/redux/thunk/kycStatusThunks'
import { Button } from '../ui/button'

const KYCStatus = () => {
    const dispatch = useAppDispatch()
    const { data, loading, error } = useAppSelector((state) => state.kycStatus ?? { data: null, loading: false, error: null })

    useEffect(() => {
        dispatch(fetchKycStatus())
    }, [dispatch])

    const formatDate = (d?: string | null) => {
        if (!d) return '—'
        try {
            return new Date(d).toLocaleString()
        } catch {
            return d
        }
    }

    const displayStatus = () => {
        if (!data || data.status === 'not_submitted' || !data.status) return 'KYC Not Submitted'
        if (data.status === 'approved') return 'Verification Approved'
        if (data.status === 'rejected') return 'Verification Rejected'
        if (data.status === 'pending') return 'Pending Verification'
        return 'Verification in Progress'
    }

    const displayStatusLabel = () => {
        if (!data || data.status === 'not_submitted' || !data.status) return 'Not Submitted'
        const status = data.status
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    const statusColor = () => {
        if (!data || data.status === 'not_submitted' || !data.status) return 'text-yellow-500'
        return data.status === 'approved' ? 'text-green-500' : data.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-net3xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="text-center text-gray-900 dark:text-gray-100">
                        {/* Status Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
                            {loading ? (
                                <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            ) : (
                                <svg className={`w-12 h-12 ${statusColor()}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={data?.status === 'approved' ? 'M5 13l4 4L19 7' : 'M12 8v4l3 3'} />
                                </svg>
                            )}
                        </div>

                        {/* Status Title */}
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                            {loading ? 'Checking status...' : displayStatus()}
                        </h2>

                        {/* Status Message */}
                        <p className="text-gray-600 mb-8 dark:text-gray-300">
                            {error ? error : loading ? 'Fetching KYC status...' : data ? `Your KYC is ${displayStatusLabel()}.` : 'No KYC status available.'}
                        </p>

                        {/* Verification Details */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-8">
                            <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Verification Details</h3>
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Reference ID</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{data && data.status !== 'not_submitted' ? `KYC-${data.id}` : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Submission Date</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(data?.submitted_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Reviewed Date</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(data?.reviewed_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                                    <span className={`font-medium ${statusColor()}`}>
                                        {displayStatusLabel()}
                                    </span>
                                </div>

                                {/* ==== REJECTION BLOCK – ONLY SHOW WHEN REJECTED ==== */}
                                {data?.status === 'rejected' && data?.rejection_reason && (
                                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600 bg-red-200 rounded-lg p-4">
                                        <span className="text-red-600 text-sm">
                                            Your KYC verification has been rejected by the admin Reason :
                                        </span>
                                        <p className="text-sm text-red-600 my-2 font-medium">
                                            {data.rejection_reason}
                                        </p>
                                        <span className='text-red-600 text-sm'>
                                            Please update your documents and resubmit for verification
                                        </span>
                                        <div className="mt-4">
                                            <Button
                                                onClick={() => {
                                                    try {
                                                        if (typeof window !== 'undefined') {
                                                            sessionStorage.setItem('kyc_modal', '1')
                                                            window.dispatchEvent(new CustomEvent('kyc_modal_open'))
                                                        }
                                                    } catch (e) {
                                                        // ignore
                                                    }
                                                }}
                                            >
                                                Submit Your KYC Again
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {/* ==== END REJECTION BLOCK ==== */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KYCStatus