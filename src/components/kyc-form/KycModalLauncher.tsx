"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '@/context/AuthContext';
import MultiStepForm from './MultiStepform';
import { RootState } from '@/redux/store';

export default function KycModalLauncher() {
    const { submission } = useSelector((state: RootState) => state.kyc);
    const submissionData = submission?.data ?? null;
    const isSubmitted = Boolean(submissionData);

    const [show, setShow] = useState(false);

    const { isAuthenticated, isLoading: authLoading } = useAuth();

    // Initialize from sessionStorage: only show if flag is set, auth is ready and user is authenticated, and KYC not submitted
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            // Wait until auth check finishes
            if (authLoading) return;
            const flag = sessionStorage.getItem('kyc_modal');
            if (flag && isAuthenticated && !isSubmitted) {
                setShow(true);
            } else {
                setShow(false);
            }
        } catch (e) {
            // ignore
        }
    }, [isSubmitted, isAuthenticated, authLoading]);

    // When KYC gets submitted, ensure modal is hidden and clear the session flag
    useEffect(() => {
        if (isSubmitted) {
            setShow(false);
            try {
                if (typeof window !== 'undefined') sessionStorage.removeItem('kyc_modal');
            } catch (e) {
                // ignore
            }
        }
    }, [isSubmitted]);

    // If user logs out, hide the modal
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setShow(false);
        }
    }, [isAuthenticated, authLoading]);
    if (!show || isSubmitted) return null;

    // Show a full-viewport backdrop and modal with a very high z-index so it appears above header
    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative w-full max-w-6xl mx-4 pointer-events-auto">
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-r from-white/40 via-white/30 to-white/40 dark:from-gray-800/30" />
                    <div className="flex items-start justify-between p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Identity Verification</h3>
                                <p className="text-xs text-gray-500">Complete your KYC to unlock full access</p>
                            </div>
                        </div>
                        <div>
                            <button
                                aria-label="Close KYC modal"
                                onClick={() => setShow(false)}
                                className="text-gray-500 hover:text-gray-800 dark:text-gray-300 px-3 py-1 rounded-md"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[calc(100vh-8rem)] overflow-auto p-6 bg-white dark:bg-gray-900">
                        <MultiStepForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
