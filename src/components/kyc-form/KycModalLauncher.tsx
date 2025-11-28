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

    // Consider a KYC as "submitted" only when there is an explicit submission
    // or when the status exists and is neither `not_submitted` nor `rejected`.
    const isKycSubmitted = Boolean(submissionData) || Boolean(
        kycStatusData && kycStatusData.status && kycStatusData.status !== 'not_submitted' && !isKycRejected
    );

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

        // If status explicitly indicates `not_submitted` OR there is no submission/status (unknown),
        // or KYC is rejected → Show modal
        if (kycStatusData?.status === 'not_submitted' || (!submissionData && !kycStatusData) || isKycRejected) {
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

            // Open modal automatically for users who need to complete KYC
            if (shouldShowKycModal()) {
                try {
                    sessionStorage.setItem('kyc_modal', '1');
                } catch (e) {
                    // ignore
                }
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
            // If the rules indicate the modal should be shown (not submitted or rejected),
            // show it on route change as well (unless the user is on /kyc-status and rejected).
            if (shouldShowKycModal()) {
                try {
                    sessionStorage.setItem('kyc_modal', '1');
                } catch (e) {
                    // ignore
                }
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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col pointer-events-auto">
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-full">
                    <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-r from-white/40 via-white/30 to-white/40 dark:from-gray-800/30" />
                    <div className="border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                        <div className="flex items-start justify-between p-4 md:p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {isKycRejected ? 'KYC Rejected – Please Resubmit' : 'Identity Verification'}
                                    </h3>
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
                        <div className="px-4 pb-4">
                            <div className="flex flex-col items-center px-4">
                                    <div className="text-sm sm:text-base text-red-600 text-center bg-red-200 dark:bg-red-900/30 px-4  sm:px-6 sm:py-3 rounded-lg w-full sm:w-3/4 md:w-1/2">
                                    {isKycRejected ? (
                                        <>
                                            <p className="break-words">
                                               Your KYC verification has been rejected by the admin.
                                            </p>
                                            {kycStatusData?.rejection_reason && (
                                                    <div className="w-full  text-left sm:text-center dark:bg-red-900/20 px-3 sm:px-4 rounded-lg border border-red-200 dark:border-red-800">
                                                        <p className="text-sm sm:text-base font-semibold text-red-600 break-words">
                                                            <span className="font-semibold">Reason: </span>
                                                            {kycStatusData.rejection_reason}
                                                        </p>
                                                    </div>
                                            )}
                                            <p className="break-words">
                                                Please update your documents and resubmit for verification.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="break-words">
                                            Complete your KYC to unlock full access
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 min-h-0">
                        <MultiStepForm />
                    </div>
                </div>
            </div>
        </div>
    );
}