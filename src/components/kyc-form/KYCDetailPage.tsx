"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, X, CheckCircle, XCircle, Clock } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../redux/rootReducer';
import {
    fetchAdminPendingKyc,
    fetchAdminKycDetail,
    type AdminPendingKycItem,
} from '../../redux/thunk/adminKycThunks';

interface KYC {
    id: number;
    user: { email: string };
    full_name: string;
    date_of_birth: string;
    address: string;
    city: string;
    postal_code: string;
    phone_number: string;
    document_type: string;
    document_number: string;
    document_front_url: string;
    document_back_url: string;
    selfie_url: string;
    status: "approved" | "pending" | "rejected";
    submitted_at: string;
    reviewed_at: string | null;
    reviewer: string | null;
    country?: string | null;
    rejection_reason?: string | null;
}

// Data comes from Redux (adminKyc slice) via `fetchAdminPendingKyc` thunk

export default function KYCPage() {
    const [selected, setSelected] = useState<KYC | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const dispatch = useDispatch<any>();

    const { pendingList, pendingLoading, pendingError } = useSelector((state: RootState) => state.adminKyc);

    useEffect(() => {
        // load first page of pending KYC on mount
        dispatch(fetchAdminPendingKyc({ page: 1 }));
    }, [dispatch]);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

    const getStatus = (s: string) => {
        const map: any = {
            approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
            rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
            pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        };
        const item = map[s];
        const Icon = item?.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${item?.color || "bg-gray-100 text-gray-800"}`}>
                {Icon && <Icon size={14} />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        );
    };

    return (
        <>
            {/* Main Table */}
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">KYC Verifications</h1>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3 text-left">Name</th>
                                    <th className="px-5 py-3 text-left">Email</th>
                                    <th className="px-5 py-3 text-left">Document</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                    <th className="px-5 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingList.map((kyc: AdminPendingKycItem) => (
                                    <tr key={kyc.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 font-medium">{kyc.full_name}</td>
                                        <td className="px-5 py-4 text-gray-600">{kyc.user?.email}</td>
                                        <td className="px-5 py-4 capitalize">{(kyc.document_type || '').replace("_", " ")}</td>
                                        <td className="px-5 py-4">{getStatus(kyc.status)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={async () => {
                                                    setDetailLoading(true);
                                                    try {
                                                        const action = await dispatch(fetchAdminKycDetail(kyc.id));
                                                        if (action.type && action.type.endsWith('/fulfilled')) {
                                                            const payload = action.payload?.data ?? action.payload;
                                                            const mapped: KYC = {
                                                                id: payload.id ?? kyc.id,
                                                                user: { email: payload.user?.email ?? kyc.user?.email ?? '' },
                                                                full_name: payload.full_name ?? kyc.full_name,
                                                                date_of_birth: payload.date_of_birth ?? payload.dob ?? kyc.submitted_at ?? '',
                                                                address: payload.address ?? '',
                                                                city: payload.city ?? '',
                                                                postal_code: payload.postal_code ?? '',
                                                                phone_number: payload.phone_number ?? '',
                                                                document_type: payload.document_type ?? kyc.document_type ?? '',
                                                                document_number: payload.document_number ?? '',
                                                                document_front_url: payload.document_front_url ?? '',
                                                                document_back_url: payload.document_back_url ?? '',
                                                                selfie_url: payload.selfie_url ?? '',
                                                                status: payload.status ?? kyc.status,
                                                                submitted_at: payload.submitted_at ?? kyc.submitted_at ?? '',
                                                                reviewed_at: payload.reviewed_at ?? null,
                                                                reviewer: payload.reviewer ?? null,
                                                                country: payload.country ?? null,
                                                                rejection_reason: payload.rejection_reason ?? null,
                                                            };
                                                            setSelected(mapped);
                                                        } else {
                                                            // rejected
                                                            // eslint-disable-next-line no-console
                                                            console.error('Failed to load KYC detail', action.payload || action.error);
                                                            alert('Failed to load KYC details.');
                                                        }
                                                    } catch (err) {
                                                        // eslint-disable-next-line no-console
                                                        console.error('Failed to fetch KYC detail', err);
                                                        alert('Failed to load KYC details. See console for details.');
                                                    } finally {
                                                        setDetailLoading(false);
                                                    }
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mx-auto"
                                            >
                                                View <ExternalLink size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Beautiful Compact Modal */}
            {selected && (
                <div className="fixed inset-0  z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">KYC Details</h2>
                                <p className="text-sm text-gray-500">ID: {selected.id} • {getStatus(selected.status)}</p>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {detailLoading ? (
                                <div className="py-10 text-center">
                                    <div className="text-sm text-gray-500">Loading details...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Personal Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Name:</span>
                                            <p className="mt-1 font-semibold">{selected.full_name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Email:</span>
                                            <p className="mt-1">{selected.user.email}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">DOB:</span>
                                            <p className="mt-1">{formatDate(selected.date_of_birth)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Phone:</span>
                                            <p className="mt-1">{selected.phone_number}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="font-medium text-gray-600">Address:</span>
                                            <p className="mt-1">{selected.address}, {selected.city} {selected.postal_code}, Australia</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Document Type:</span>
                                                <p className="mt-1 uppercase">{selected.document_type.replace("_", " ")}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Document No:</span>
                                                <p className="mt-1 font-mono">{selected.document_number}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Images - Compact Grid */}
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-3">Verification Images</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { url: selected.document_front_url, label: "Front" },
                                                { url: selected.document_back_url, label: "Back" },
                                                { url: selected.selfie_url, label: "Selfie" },
                                            ].map((img) => (
                                                <div
                                                    key={img.label}
                                                    onClick={() => window.open(img.url, "_blank")}
                                                    className="group relative rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer transition"
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt={img.label}
                                                        width={300}
                                                        height={200}
                                                        className="w-full h-48 object-cover group-hover:scale-105 transition"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100" size={32} />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                        <p className="text-white text-xs font-medium text-center">{img.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="border-t pt-4 text-xs text-gray-500 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Submitted:</span>
                                            <span>{formatDate(selected.submitted_at)}</span>
                                        </div>
                                        {selected.reviewed_at && (
                                            <div className="flex justify-between">
                                                <span>Reviewed:</span>
                                                <span>{formatDate(selected.reviewed_at)} by {selected.reviewer}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}