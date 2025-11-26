"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import MultiStepForm from './MultiStepform';
import { fetchKycStatus } from '@/redux/thunk/kycStatusThunks';
import { usePathname } from 'next/navigation';

export default function KycModalLauncher() {
    const { submission } = useAppSelector((state) => state.kyc);
    const submissionData = submission?.data ?? null;

    const kycStatus = useAppSelector((state) => state.kycStatus);
    const kycStatusData = kycStatus?.data ?? null;

    const isKycApproved = kycStatusData?.status === 'approved';
    const isKycRejected = kycStatusData?.status === 'rejected';
    const isKycPending = kycStatusData?.status === 'pending' || kycStatusData?.status === 'processing';
    
    // Agar submission data hai (user ne submit kiya) AUR rejected nahi - matlab submitted hai
    const isKycSubmitted = (submissionData || kycStatusData) && !isKycRejected;

    const [show, setShow] = useState(false);
    const pathname = usePathname();
    const previousPathname = useRef(pathname);

    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const dispatch = useAppDispatch();

    // Modal sirf 2 cases mein dikhana:
    // 1. KYC submit nahi kiya (no submission & no status)
    // 2. KYC rejected hai
    const shouldShowKycModal = () => {
        if (!isAuthenticated || user?.role !== UserRole.USER) return false;
        
        // Agar submitted hai (approved, pending, ya koi bhi submission jo rejected nahi) to modal NAHI
        if (isKycSubmitted) return false;

        // Agar rejected hai BUT /kyc-status page par hai to modal NAHI dikhana
        if (isKycRejected && pathname === '/kyc-status') {
            return false;
        }

        // Agar koi submission/status nahi (not submitted) YA rejected hai → Show modal
        if ((!submissionData && !kycStatusData) || isKycRejected) {
            return true;
        }

        return false;
    };

    // Effect for initial check (login time)
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            if (authLoading) return;

            if (isAuthenticated && user?.role === UserRole.USER && !kycStatusData && !kycStatus.loading) {
                try {
                    dispatch(fetchKycStatus());
                } catch (e) {
                    // ignore
                }
            }

            const flag = sessionStorage.getItem('kyc_modal');
            if (flag && shouldShowKycModal()) {
                setShow(true);
            }
        } catch (e) {
            // ignore
        }
    }, [isAuthenticated, authLoading, user?.role, kycStatusData, isKycApproved]);

    // Effect for route changes
    useEffect(() => {
        if (previousPathname.current === pathname) return;
        previousPathname.current = pathname;

        try {
            if (typeof window === 'undefined') return;
            const flag = sessionStorage.getItem('kyc_modal');
            if (flag && shouldShowKycModal()) {
                setShow(true);
            }
        } catch (e) {
            // ignore
        }
    }, [pathname, isAuthenticated, user?.role, kycStatusData, isKycApproved]);

    // Jab KYC submit ho jaye (approved, pending, ya koi bhi) to hide karo
    useEffect(() => {
        if (isKycSubmitted) {
            setShow(false);
            try {
                if (typeof window !== 'undefined') sessionStorage.removeItem('kyc_modal');
            } catch (e) {
                // ignore
            }
        }
    }, [isKycSubmitted]);

    // Logout par hide
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setShow(false);
        }
    }, [isAuthenticated, authLoading]);

    // Listen for external requests to open the KYC modal (e.g. button click elsewhere)
    // NOTE: When the explicit `kyc_modal_open` event is received we open the modal
    // as long as the user is authenticated, is a regular USER and the KYC isn't approved.
    // This intentionally ignores the "rejected on /kyc-status hide" special-case so
    // a user can re-open the modal from the status page by clicking the button.
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handler = () => {
            try {
                if (!isAuthenticated || user?.role !== UserRole.USER) return;
                if (isKycSubmitted) return;

                try {
                    sessionStorage.setItem('kyc_modal', '1');
                } catch { }

                setShow(true);
            } catch (e) {
                // ignore
            }
        };

        window.addEventListener('kyc_modal_open', handler as EventListener);
        return () => window.removeEventListener('kyc_modal_open', handler as EventListener);
    }, [isAuthenticated, authLoading, user?.role, isKycSubmitted]);

    // Agar submitted hai (approved, pending, etc) to kuch render nahi
    if (isKycSubmitted) return null;
    // Allow rendering when an explicit `show` is set (e.g. user clicked "Submit Your KYC").
    // Only block rendering when not explicitly requested AND general rules disallow it.
    if (!show && !shouldShowKycModal()) return null;
    // If nothing requested to show, don't render
    if (!show) return null;

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
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {isKycRejected ? 'KYC Rejected – Please Resubmit' : 'Identity Verification'}
                                </h3>
                                <p className="text-lg text-red-600 text-center  ">
                                    {isKycRejected
                                        ? 'Your previous submission was rejected. Please review and submit again.'
                                        : 'Complete your KYC to unlock full access'}
                                </p>
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

                    <div className="max-h-[calc(100vh-8rem)] overflow-auto bg-white dark:bg-gray-900">
                        <MultiStepForm />
                    </div>
                </div>
            </div>
        </div>
    );
}