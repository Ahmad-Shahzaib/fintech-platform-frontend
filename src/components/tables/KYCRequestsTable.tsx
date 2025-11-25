"use client"
import { useState, useMemo, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, Eye, Check, X, Search, Filter, Download, Clock, AlertCircle, CheckCircle, MoreVertical } from "lucide-react"
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

import type { AppDispatch } from '@/redux/store'
import type { RootState } from '@/redux/rootReducer'
import { fetchAdminPendingKyc, approveAdminKyc, rejectAdminKyc } from '@/redux/thunk/adminKycThunks'

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
    const dispatch = useDispatch<AppDispatch>()
    const adminPending = useSelector((state: RootState) => state.adminKyc?.pendingList ?? [])
    const adminLoading = useSelector((state: RootState) => state.adminKyc?.pendingLoading ?? false)

    useEffect(() => {
        dispatch(fetchAdminPendingKyc())
    }, [dispatch])

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
    const [sortBy, setSortBy] = useState<"date" | "name">("date")

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
        dispatch(approveAdminKyc(rawId))
    }

    const handleReject = (rawId?: number) => {
        if (!rawId) return
        dispatch(rejectAdminKyc(rawId))
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
                                        <DropdownMenuItem className="gap-2">
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
                                                <DropdownMenuItem className="gap-2">
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
        </div>
    )
}