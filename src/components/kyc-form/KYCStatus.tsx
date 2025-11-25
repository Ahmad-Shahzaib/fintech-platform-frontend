"use client"

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchKycStatus } from '@/redux/thunk/kycStatusThunks'
import type { AppDispatch } from '@/redux/store'
import type { RootState } from '@/redux/rootReducer'

const KYCStatus = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { data, loading, error } = useSelector((state: RootState) => state.kycStatus ?? { data: null, loading: false, error: null })

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

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="text-center">
                        {/* Status Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-blue-100">
                            {loading ? (
                                <svg className="w-12 h-12 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            ) : (
                                <svg className={`w-12 h-12 ${data?.status === 'approved' ? 'text-green-500' : data?.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={data?.status === 'approved' ? 'M5 13l4 4L19 7' : 'M12 8v4l3 3'} />
                                </svg>
                            )}
                        </div>

                        {/* Status Title */}
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {loading ? 'Checking status...' : data ? (data.status === 'approved' ? 'Verification Approved' : data.status === 'rejected' ? 'Verification Rejected' : 'Verification in Progress') : 'Verification Status'}
                        </h2>

                        {/* Status Message */}
                        <p className="text-gray-600 mb-8">
                            {error ? error : loading ? 'Fetching KYC status...' : data ? `Your KYC is ${data.status}.` : 'No KYC status available.'}
                        </p>

                        {/* Verification Details */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Verification Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Reference ID</span>
                                    <span className="font-medium">{data ? `KYC-${data.id}` : '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Submission Date</span>
                                    <span className="font-medium">{formatDate(data?.submitted_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Reviewed Date</span>
                                    <span className="font-medium">{formatDate(data?.reviewed_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span className={`font-medium ${data?.status === 'approved' ? 'text-green-600' : data?.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{data ? data.status : '—'}</span>
                                </div>
                                {data?.rejection_reason && (
                                    <div className="pt-2">
                                        <span className="text-gray-500 text-sm">Rejection Reason</span>
                                        <p className="text-sm text-red-600 mt-1">{data.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={() => dispatch(fetchKycStatus())} className="px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl">
                                Refresh
                            </button>
                            <a href="/login" className="px-6 py-3 bg-gray-100 text-gray-800 text-sm font-medium rounded-xl inline-flex items-center justify-center">
                                Continue to Login Page
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KYCStatus