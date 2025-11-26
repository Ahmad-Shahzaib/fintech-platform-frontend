"use client"
import { useState, useMemo, useEffect } from "react"
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import Image from "next/image"
import { ChevronDown, Eye, Check, X, Search, Filter, Download, Clock, AlertCircle, CheckCircle, MoreVertical, ExternalLink, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { fetchAdminPendingKyc, approveAdminKyc, rejectAdminKyc, fetchAdminKycDetail } from '@/redux/thunk/adminKycThunks'

interface KYCDetail {
    id: number
    user: { email: string }
    full_name: string
    date_of_birth: string
    address: string
    city: string
    postal_code: string
    phone_number: string
    document_type: string
    document_number: string
    document_front_url: string
    document_back_url: string
    selfie_url: string
    status: "approved" | "pending" | "rejected"
    submitted_at: string
    reviewed_at: string | null
    reviewer: string | null
    country?: string | null
    rejection_reason?: string | null
}

interface KYCRequest {
    id: string
    name: string
    email: string
    date: string
    status: "pending" | "approved" | "rejected"
    documentType: string
    submittedAmount: number
    country: string
    rawId?: number
}

export function KYCRequestsTable() {
    const dispatch = useAppDispatch()
    const adminPending = useAppSelector((state) => state.adminKyc?.pendingList ?? [])
    const adminLoading = useAppSelector((state) => state.adminKyc?.pendingLoading ?? false)

    useEffect(() => {
        dispatch(fetchAdminPendingKyc())
    }, [dispatch])

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
    const [sortBy, setSortBy] = useState<"date" | "name">("date")
    const [selectedDetail, setSelectedDetail] = useState<KYCDetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)

    // New states for modals
    const [showApproveModal, setShowApproveModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [currentActionId, setCurrentActionId] = useState<number | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")

    // Build base list from admin API when available, otherwise return empty array
    const baseRequests = useMemo(() => {
        if (adminPending && adminPending.length > 0) {
            return adminPending.map((item) => ({
                id: `KYC-${item.id}`,
                name: item.full_name || item.user?.name || 'Unknown',
                email: item.user?.email || '',
                date: item.submitted_at,
                status: (item.status as "pending" | "approved" | "rejected") || 'pending',
                documentType: item.document_type || '',
                submittedAmount: 0,
                country: '',
                rawId: item.id,
            }))
        }
        return [] // Return empty array instead of undefined
    }, [adminPending])

    const handleApprove = (rawId?: number) => {
        if (!rawId) return
        setCurrentActionId(rawId)
        setShowApproveModal(true)
    }

    const handleReject = (rawId?: number) => {
        if (!rawId) return
        setCurrentActionId(rawId)
        setShowRejectModal(true)
        setRejectionReason("")
    }

    const confirmApprove = () => {
        if (currentActionId) {
            dispatch(approveAdminKyc(currentActionId))
            setShowApproveModal(false)
            setCurrentActionId(null)
        }
    }

    const confirmReject = () => {
        if (currentActionId) {
            dispatch(rejectAdminKyc({ id: currentActionId, rejection_reason: rejectionReason.trim() }))
            setShowRejectModal(false)
            setCurrentActionId(null)
            setRejectionReason("")
        }
    }

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })

    const getStatus = (s: string) => {
        const map: any = {
            approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
            rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
            pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
        }
        const item = map[s]
        const Icon = item?.icon
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${item?.color || "bg-gray-100 text-gray-800"}`}>
                {Icon && <Icon size={14} />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        )
    }

    const handleView = async (rawId?: number) => {
        if (!rawId) return
        setDetailLoading(true)
        try {
            const action: any = await dispatch(fetchAdminKycDetail(rawId))
            if (action.type && action.type.endsWith('/fulfilled')) {
                const payload: any = (action.payload as any)?.data ?? action.payload
                const mapped: KYCDetail = {
                    id: payload.id ?? rawId,
                    user: { email: payload.user?.email ?? '' },
                    full_name: payload.full_name ?? payload.name ?? 'Unknown',
                    date_of_birth: payload.date_of_birth ?? payload.dob ?? payload.submitted_at ?? '',
                    address: payload.address ?? '',
                    city: payload.city ?? '',
                    postal_code: payload.postal_code ?? '',
                    phone_number: payload.phone_number ?? '',
                    document_type: payload.document_type ?? '',
                    document_number: payload.document_number ?? '',
                    document_front_url: payload.document_front_url ?? '',
                    document_back_url: payload.document_back_url ?? '',
                    selfie_url: payload.selfie_url ?? '',
                    status: payload.status ?? 'pending',
                    submitted_at: payload.submitted_at ?? '',
                    reviewed_at: payload.reviewed_at ?? null,
                    reviewer: payload.reviewer ?? null,
                    country: payload.country ?? null,
                    rejection_reason: payload.rejection_reason ?? null,
                }
                setSelectedDetail(mapped)
            } else {
                // eslint-disable-next-line no-console
                console.error('Failed to load KYC detail', action.payload || action.error)
                alert('Failed to load KYC details.')
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch KYC detail', err)
            alert('Failed to load KYC details. See console for details.')
        } finally {
            setDetailLoading(false)
        }
    }

    const filteredRequests = useMemo(() => {
        // Now baseRequests is always an array, so we can safely filter
        const filtered = baseRequests.filter((request) => {
            const matchesSearch =
                request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.id.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = selectedStatus === "all" || request.status === selectedStatus
            return matchesSearch && matchesStatus
        })

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name)
                case "date":
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
            }
        })
        return filtered
    }, [baseRequests, searchTerm, selectedStatus, sortBy])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="w-4 h-4" />
            case "rejected":
                return <AlertCircle className="w-4 h-4" />
            case "pending":
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-50 text-green-700 border-green-200"
            case "rejected":
                return "bg-red-50 text-red-700 border-red-200"
            case "pending":
            default:
                return "bg-yellow-50 text-yellow-700 border-yellow-200"
        }
    }

    const stats = {
        total: baseRequests.length,
        pending: baseRequests.filter((r) => r.status === "pending").length,
        approved: baseRequests.filter((r) => r.status === "approved").length,
        rejected: baseRequests.filter((r) => r.status === "rejected").length,
    }

    if (adminLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-primary/70"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 w-full max-w-6xl">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card dark:bg-gray-800 dark:border-gray-700 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-card dark:bg-gray-800 dark:border-gray-700 border border-border hover:border-yellow-300/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Pending</p>
                            <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-card dark:bg-gray-800 dark:border-gray-700 border border-border hover:border-green-300/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Approved</p>
                            <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-card dark:bg-gray-800 dark:border-gray-700 border border-border hover:border-red-300/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                            <p className="text-2xl font-bold text-foreground">{stats.rejected}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <X className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="p-4 bg-card dark:bg-gray-800 dark:border-gray-700 border border-border">
                <div className="flex flex-col md:flex-row gap-4 flex-wrap items-center">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-input border-border text-foreground hover:bg-muted">
                                <Filter className="w-4 h-4" />
                                {selectedStatus === "all" ? "All Status" : selectedStatus}
                                <ChevronDown className="w-4 h-4 ml-auto" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedStatus("all")}>All Status</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedStatus("pending")}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedStatus("approved")}>Approved</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedStatus("rejected")}>Rejected</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-input border-border text-foreground hover:bg-muted">
                                Sort: {sortBy === "date" ? "Date" : "Name"}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSortBy("date")}>By Date</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("name")}>By Name</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </Card>

            {/* Mobile List */}
            <div className="md:hidden space-y-3">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <Card key={request.id} className="p-4 bg-card dark:bg-gray-800 dark:border-gray-700 border border-border">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-sm font-mono text-primary font-medium">{request.id}</p>
                                    <p className="text-sm text-foreground font-semibold">{request.name}</p>
                                    <p className="text-xs text-muted-foreground">{request.email}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="gap-2" onClick={() => handleView(request.rawId)}>
                                            <Eye className="w-4 h-4" /> View
                                        </DropdownMenuItem>

                                        {request.status === "pending" && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="gap-2 text-green-600" onClick={() => handleApprove(request.rawId)}>
                                                    <Check className="w-4 h-4" /> Approve
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleReject(request.rawId)}>
                                                    <X className="w-4 h-4" /> Reject
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <Badge variant="outline" className={`gap-1.5 ${getStatusColor(request.status)}`}>
                                    {getStatusIcon(request.status)}
                                    <span className="capitalize">{request.status}</span>
                                </Badge>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="px-6 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No KYC requests found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <Card className="bg-card dark:bg-gray-800 dark:border-gray-700 border border-border overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50 dark:bg-muted/30">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Request ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden lg:table-cell">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden xl:table-cell">Document Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-primary font-medium">{request.id}</td>
                                    <td className="px-6 py-4 text-sm text-foreground font-medium">{request.name}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">{request.email}</td>
                                    <td className="px-6 py-4 text-sm text-foreground hidden xl:table-cell">
                                        <Badge variant="outline" className="bg-muted text-foreground border-border">
                                            {request.documentType}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={`gap-1.5 ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            <span className="capitalize">{request.status}</span>
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {new Date(request.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2" onClick={() => handleView(request.rawId)}>
                                                    <Eye className="w-4 h-4" /> View Details
                                                </DropdownMenuItem>
                                                {request.status === "pending" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2 text-green-600 font-medium" onClick={() => handleApprove(request.rawId)}>
                                                            <Check className="w-4 h-4" /> Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 text-red-600 font-medium" onClick={() => handleReject(request.rawId)}>
                                                            <X className="w-4 h-4" /> Reject
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredRequests.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No KYC requests found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredRequests.length} of {baseRequests.length} requests
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" disabled className="bg-input border-border text-foreground hover:bg-muted">
                        Previous
                    </Button>
                    <Button variant="outline" disabled className="bg-input border-border text-foreground hover:bg-muted">
                        Next
                    </Button>
                </div>
            </div>

            {/* Beautiful Compact Modal - Images in Vertical Order */}
            {selectedDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">KYC Details</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    ID: {selectedDetail.id} • {getStatus(selectedDetail.status)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 text-gray-900 dark:text-gray-100">
                            {detailLoading ? (
                                <div className="py-16 text-center">
                                    <div className="text-gray-500 dark:text-gray-300">Loading details...</div>
                                </div>
                            ) : (
                                <>
                                    {/* Personal Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="font-medium text-gray-600 dark:text-gray-300">Name:</span><p className="font-semibold mt-1">{selectedDetail.full_name}</p></div>
                                        <div><span className="font-medium text-gray-600 dark:text-gray-300">Email:</span><p className="mt-1">{selectedDetail.user.email}</p></div>
                                        <div><span className="font-medium text-gray-600 dark:text-gray-300">DOB:</span><p className="mt-1">{formatDate(selectedDetail.date_of_birth)}</p></div>
                                        <div><span className="font-medium text-gray-600 dark:text-gray-300">Phone:</span><p className="mt-1">{selectedDetail.phone_number}</p></div>
                                        <div className="md:col-span-2">
                                            <span className="font-medium text-gray-600 dark:text-gray-300">Address:</span>
                                            <p className="mt-1">{selectedDetail.address}, {selectedDetail.city} {selectedDetail.postal_code}{selectedDetail.country ? `, ${selectedDetail.country}` : ''}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><span className="font-medium text-gray-600 dark:text-gray-300">Document Type:</span><p className="mt-1 uppercase">{(selectedDetail.document_type || '').replace("_", " ")}</p></div>
                                            <div><span className="font-medium text-gray-600 dark:text-gray-300">Document No:</span><p className="mt-1 font-mono">{selectedDetail.document_number}</p></div>
                                        </div>
                                    </div>

                                    {/* Images - Vertical Full Width Layout */}
                                    <div className="space-y-6">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Verification Documents</h3>

                                        {/* Front Image */}
                                        {selectedDetail.document_front_url ? (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Front Side</p>
                                                <div
                                                    onClick={() => window.open(selectedDetail.document_front_url!, "_blank")}
                                                    className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition"
                                                >
                                                    <Image
                                                        src={selectedDetail.document_front_url}
                                                        alt="Document Front"
                                                        width={200}
                                                        height={200}
                                                        unoptimized
                                                        className=" h-auto  object-contain bg-gray-50 dark:bg-gray-900"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100" size={36} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                <p className="text-gray-500 text-sm">Front document not available</p>
                                            </div>
                                        )}

                                        {/* Back Image (only if exists and not passport) */}
                                        {selectedDetail.document_back_url && !selectedDetail.document_type?.toLowerCase().includes('passport') && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Back Side</p>
                                                <div
                                                    onClick={() => window.open(selectedDetail.document_back_url!, "_blank")}
                                                    className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition"
                                                >
                                                    <Image
                                                        src={selectedDetail.document_back_url}
                                                        alt="Document Back"
                                                        width={200}
                                                        height={200}
                                                        unoptimized
                                                        className=" h-auto  object-contain bg-gray-50 dark:bg-gray-900"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100" size={36} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Selfie */}
                                        {selectedDetail.selfie_url ? (
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Selfie Verification</p>
                                                <div
                                                    onClick={() => window.open(selectedDetail.selfie_url!, "_blank")}
                                                    className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition"
                                                >
                                                    <Image
                                                        src={selectedDetail.selfie_url}
                                                        alt="Selfie"
                                                        width={200}
                                                        height={200}
                                                        unoptimized
                                                        className=" h-auto  object-contain rounded-xl bg-gray-50 dark:bg-gray-900"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                                        <ExternalLink className="text-white opacity-0 group-hover:opacity-100" size={36} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                <p className="text-gray-500 text-sm">Selfie not available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Info */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500 dark:text-gray-300 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Submitted:</span>
                                            <span>{formatDate(selectedDetail.submitted_at)}</span>
                                        </div>
                                        {selectedDetail.reviewed_at && (
                                            <div className="flex justify-between">
                                                <span>Reviewed:</span>
                                                <span>{formatDate(selectedDetail.reviewed_at)} by {selectedDetail.reviewer}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Confirmation Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Approve KYC</h3>
                        <p>Are you sure you want to approve this KYC request?</p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmApprove}>
                                Yes, Approve
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Reject KYC</h3>
                        <p className="mb-2">Please provide a reason for rejection:</p>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={confirmReject}
                                disabled={!rejectionReason.trim()}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}