"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Eye, Check, X, Search, Filter, Download, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface KYCRequest {
    id: string
    name: string
    email: string
    date: string
    status: "pending" | "approved" | "rejected"
    documentType: string
    submittedAmount: number
    country: string
}

const mockKYCRequests: KYCRequest[] = [
    {
        id: "KYC-001",
        name: "John Anderson",
        email: "john.anderson@email.com",
        date: "2025-11-18",
        status: "pending",
        documentType: "Passport",
        submittedAmount: 50000,
        country: "United States",
    },
    {
        id: "KYC-002",
        name: "Sarah Mitchell",
        email: "sarah.mitchell@email.com",
        date: "2025-11-17",
        status: "approved",
        documentType: "Driver License",
        submittedAmount: 25000,
        country: "Canada",
    },
    {
        id: "KYC-003",
        name: "Michael Chen",
        email: "michael.chen@email.com",
        date: "2025-11-16",
        status: "rejected",
        documentType: "National ID",
        submittedAmount: 75000,
        country: "Singapore",
    },
    {
        id: "KYC-004",
        name: "Emma Rodriguez",
        email: "emma.rodriguez@email.com",
        date: "2025-11-15",
        status: "pending",
        documentType: "Passport",
        submittedAmount: 40000,
        country: "Mexico",
    },
    {
        id: "KYC-005",
        name: "David Thompson",
        email: "david.thompson@email.com",
        date: "2025-11-14",
        status: "approved",
        documentType: "Passport",
        submittedAmount: 100000,
        country: "United Kingdom",
    },
    {
        id: "KYC-006",
        name: "Lisa Wagner",
        email: "lisa.wagner@email.com",
        date: "2025-11-13",
        status: "pending",
        documentType: "Driver License",
        submittedAmount: 30000,
        country: "Germany",
    },
    {
        id: "KYC-007",
        name: "Alex Park",
        email: "alex.park@email.com",
        date: "2025-11-12",
        status: "approved",
        documentType: "National ID",
        submittedAmount: 60000,
        country: "South Korea",
    },
    {
        id: "KYC-008",
        name: "Nina Patel",
        email: "nina.patel@email.com",
        date: "2025-11-11",
        status: "rejected",
        documentType: "Passport",
        submittedAmount: 90000,
        country: "India",
    },
]

export function KYCRequestsTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
    const [sortBy, setSortBy] = useState<"date" | "name" | "amount">("date")

    // Filter and sort data
    const filteredRequests = useMemo(() => {
        const filtered = mockKYCRequests.filter((request) => {
            const matchesSearch =
                request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.id.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = selectedStatus === "all" || request.status === selectedStatus

            return matchesSearch && matchesStatus
        })

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name)
                case "amount":
                    return b.submittedAmount - a.submittedAmount
                case "date":
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime()
            }
        })

        return filtered
    }, [searchTerm, selectedStatus, sortBy])

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
        total: mockKYCRequests.length,
        pending: mockKYCRequests.filter((r) => r.status === "pending").length,
        approved: mockKYCRequests.filter((r) => r.status === "approved").length,
        rejected: mockKYCRequests.filter((r) => r.status === "rejected").length,
    }

    return (
        <div className="space-y-6 w-full max-w-6xl">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card border border-border hover:border-primary/30 transition-colors">
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

                <Card className="p-4 bg-card border border-border hover:border-yellow-300/30 transition-colors">
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

                <Card className="p-4 bg-card border border-border hover:border-green-300/30 transition-colors">
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

                <Card className="p-4 bg-card border border-border hover:border-red-300/30 transition-colors">
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
            <Card className="p-4 bg-card border border-border">
                <div className="flex flex-col md:flex-row gap-4 flex-wrap items-center">
                    {/* Search */}
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

                    {/* Status Filter */}
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

                    {/* Sort */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-input border-border text-foreground hover:bg-muted">
                                Sort: {sortBy}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSortBy("date")}>By Date</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("name")}>By Name</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("amount")}>By Amount</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Export Button */}
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </Card>

            {/* Mobile list (shown on small screens) */}
            <div className="md:hidden space-y-3">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <Card key={request.id} className="p-4 bg-card border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-mono text-primary font-medium">{request.id}</p>
                                    <p className="text-sm text-foreground font-semibold">{request.name}</p>
                                    <p className="text-xs text-muted-foreground">{request.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground">${request.submittedAmount.toLocaleString()}</p>
                                    <div className="mt-2">
                                        <Badge variant="outline" className={`gap-1.5 ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            <span className="capitalize">{request.status}</span>
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline" className="gap-1 bg-input border-border text-foreground hover:bg-muted">
                                    <Eye className="w-4 h-4" />
                                    <span className="inline">View</span>
                                </Button>
                                {request.status === "pending" && (
                                    <>
                                        <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                                            <Check className="w-4 h-4" />
                                            <span className="inline">Approve</span>
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                                            <X className="w-4 h-4" />
                                            <span className="inline">Reject</span>
                                        </Button>
                                    </>
                                )}
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

            {/* Desktop table (hidden on small screens) */}
            <Card className="bg-card border border-border overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Request ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Country</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground hidden md:table-cell">Document Type</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Amount (USD)</th>
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
                                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{request.email}</td>
                                    <td className="px-6 py-4 text-sm text-foreground hidden md:table-cell">{request.country}</td>
                                    <td className="px-6 py-4 text-sm text-foreground hidden md:table-cell">
                                        <Badge variant="outline" className="bg-muted text-foreground border-border">
                                            {request.documentType}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">
                                        ${request.submittedAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className={`gap-1.5 ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            <span className="capitalize">{request.status}</span>
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                                        {new Date(request.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1 bg-input border-border text-foreground hover:bg-muted"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>
                                            {request.status === "pending" && (
                                                <>
                                                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                                                        <Check className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Approve</span>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Reject</span>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
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
                    Showing {filteredRequests.length} of {mockKYCRequests.length} requests
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-input border-border text-foreground hover:bg-muted">
                        Previous
                    </Button>
                    <Button variant="outline" className="bg-input border-border text-foreground hover:bg-muted">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
