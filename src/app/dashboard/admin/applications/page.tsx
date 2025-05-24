"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
    FileText,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Trash2,
    Loader2,
    MessageSquare,
    Calendar,
    User,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SERVER_URL } from "@/constants"

interface AppUser {
    _id: string
    fullName: string
    email: string
}

interface Application {
    _id: string
    title: string
    description: string
    proofDocuments: string[]
    fullName: string
    email: string
    additionalDetails: string
    status: "pending" | "approved" | "rejected"
    user: AppUser
    campaign?: {
        _id: string
        title: string
    }
    createdAt: string
    updatedAt: string
}

const AdminApplicationsPage = () => {
    const { user, token } = useAuth()
    const [applications, setApplications] = useState<Application[]>([])
    const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("newest")
    const [selectedApplications, setSelectedApplications] = useState<string[]>([])
    const [bulkActionLoading, setBulkActionLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    // Check if user is admin
    const isAdmin = user?.role === "admin" || user?.role === "superadmin"

    useEffect(() => {
        if (!isAdmin) {
            router.push("/dashboard")
            return
        }
    }, [isAdmin, router])

    useEffect(() => {
        const fetchApplications = async () => {
            if (!token || !isAdmin) return

            setLoading(true)
            try {
                let url = `${SERVER_URL}/api/applications?`

                if (statusFilter && statusFilter !== "all") {
                    url += `status=${statusFilter}&`
                }

                if (sortBy) {
                    url += `sort=${sortBy}`
                }

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    setApplications(data.applications)
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load applications",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error("Error fetching applications:", error)
                toast({
                    title: "Error",
                    description: "Failed to load applications",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchApplications()
    }, [token, isAdmin, statusFilter, sortBy, toast])

    // Apply search filter
    useEffect(() => {
        let filtered = [...applications]

        if (searchTerm) {
            filtered = filtered.filter(
                (app) =>
                    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.description.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        setFilteredApplications(filtered)
    }, [applications, searchTerm])

    const handleStatusUpdate = async (applicationId: string, newStatus: "approved" | "rejected", message?: string) => {
        if (!token) return

        try {
            const response = await fetch(`${SERVER_URL}/api/applications/${applicationId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: newStatus,
                    message: message || `Application has been ${newStatus}`,
                }),
            })

            if (response.ok) {
                const data = await response.json()

                // Update the application in the list
                setApplications((prev) =>
                    prev.map((app) => (app._id === applicationId ? { ...app, ...data.application } : app)),
                )

                toast({
                    title: "Success",
                    description: `Application ${newStatus} successfully`,
                })
            } else {
                const data = await response.json()
                toast({
                    title: "Error",
                    description: data.message || `Failed to ${newStatus} application`,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating application status:", error)
            toast({
                title: "Error",
                description: "Failed to update application status",
                variant: "destructive",
            })
        }
    }

    const handleDeleteApplication = async (applicationId: string) => {
        if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
            return
        }

        if (!token) return

        try {
            const response = await fetch(`${SERVER_URL}/api/applications/${applicationId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setApplications((prev) => prev.filter((app) => app._id !== applicationId))
                toast({
                    title: "Success",
                    description: "Application deleted successfully",
                })
            } else {
                const data = await response.json()
                toast({
                    title: "Error",
                    description: data.message || "Failed to delete application",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error deleting application:", error)
            toast({
                title: "Error",
                description: "Failed to delete application",
                variant: "destructive",
            })
        }
    }

    const handleBulkStatusUpdate = async (newStatus: "approved" | "rejected") => {
        if (selectedApplications.length === 0) {
            toast({
                title: "Error",
                description: "Please select applications to update",
                variant: "destructive",
            })
            return
        }

        if (!confirm(`Are you sure you want to ${newStatus} ${selectedApplications.length} application(s)?`)) {
            return
        }

        setBulkActionLoading(true)
        try {
            const promises = selectedApplications.map((id) =>
                handleStatusUpdate(id, newStatus, `Application has been ${newStatus} via bulk action`),
            )

            await Promise.all(promises)
            setSelectedApplications([])

            toast({
                title: "Success",
                description: `${selectedApplications.length} application(s) ${newStatus} successfully`,
            })
        } catch (error) {
            console.error("Error in bulk status update:", error)
            toast({
                title: "Error",
                description: "Some applications failed to update",
                variant: "destructive",
            })
        } finally {
            setBulkActionLoading(false)
        }
    }

    const toggleApplicationSelection = (applicationId: string) => {
        setSelectedApplications((prev) =>
            prev.includes(applicationId) ? prev.filter((id) => id !== applicationId) : [...prev, applicationId],
        )
    }

    const toggleSelectAll = () => {
        if (selectedApplications.length === filteredApplications.length) {
            setSelectedApplications([])
        } else {
            setSelectedApplications(filteredApplications.map((app) => app._id))
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800 hover:bg-green-100"
            case "rejected":
                return "bg-red-100 text-red-800 hover:bg-red-100"
            default:
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        }
    }

    const getStatusCounts = () => {
        const total = applications.length
        const pending = applications.filter((app) => app.status === "pending").length
        const approved = applications.filter((app) => app.status === "approved").length
        const rejected = applications.filter((app) => app.status === "rejected").length

        return { total, pending, approved, rejected }
    }

    if (!isAdmin) {
        return null
    }

    const statusCounts = getStatusCounts()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Applications</h1>
                    <p className="text-gray-500">Review and manage all application submissions</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{statusCounts.total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Pending Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search applications..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkStatusUpdate("approved")}
                                    disabled={selectedApplications.length === 0 || bulkActionLoading}
                                    className="flex-1"
                                >
                                    {bulkActionLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    <span className="ml-1 hidden sm:inline">Approve</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBulkStatusUpdate("rejected")}
                                    disabled={selectedApplications.length === 0 || bulkActionLoading}
                                    className="flex-1"
                                >
                                    {bulkActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                    <span className="ml-1 hidden sm:inline">Reject</span>
                                </Button>
                            </div>
                        </div>

                        {selectedApplications.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-blue-800">
                                    {selectedApplications.length} application(s) selected
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedApplications([])}
                                        className="ml-2 h-auto p-0 text-blue-600"
                                    >
                                        Clear selection
                                    </Button>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Applications List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedApplications.length === filteredApplications.length && filteredApplications.length > 0
                                    }
                                    onChange={toggleSelectAll}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-500">Select All</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                            </div>
                        ) : filteredApplications.length > 0 ? (
                            <div className="space-y-4">
                                {filteredApplications.map((application) => (
                                    <div
                                        key={application._id}
                                        className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${selectedApplications.includes(application._id) ? "bg-blue-50 border-blue-200" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedApplications.includes(application._id)}
                                                onChange={() => toggleApplicationSelection(application._id)}
                                                className="mt-1 rounded border-gray-300"
                                            />

                                            <div className="flex-1">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold text-lg">{application.title}</h3>
                                                            <Badge className={getStatusColor(application.status)}>
                                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4" />
                                                                <span>{application.fullName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>{formatDate(application.createdAt)}</span>
                                                            </div>
                                                        </div>

                                                        <p className="text-gray-600 mt-2 line-clamp-2">{application.description}</p>

                                                        {application.proofDocuments && application.proofDocuments.length > 0 && (
                                                            <div className="mt-2">
                                                                <span className="text-sm text-gray-500">
                                                                    {application.proofDocuments.length} document(s) attached
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <div className="flex gap-2">
                                                            <Link href={`/dashboard/applications/${application._id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                            </Link>
                                                            <Link href={`/dashboard/messages?application=${application._id}`}>
                                                                <Button variant="outline" size="sm">
                                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                                    Message
                                                                </Button>
                                                            </Link>
                                                        </div>

                                                        {application.status === "pending" && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleStatusUpdate(application._id, "approved")}
                                                                    className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleStatusUpdate(application._id, "rejected")}
                                                                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        )}

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteApplication(application._id)}
                                                            className="border-red-200 text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No applications found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {searchTerm || statusFilter !== "all"
                                        ? "Try adjusting your search or filters to find what you're looking for."
                                        : "No applications have been submitted yet."}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default AdminApplicationsPage
