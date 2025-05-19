"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"

interface Application {
    _id: string
    title: string
    description: string
    status: string
    createdAt: string
}

const ApplicationsPage = () => {
    const { token } = useAuth()
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("all")
    const [sortBy, setSortBy] = useState("newest")

    useEffect(() => {
        const fetchApplications = async () => {
            if (!token) return

            setLoading(true)
            try {
                const response = await fetch(`${SERVER_URL}/api/applications/my-applications`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    let filteredApplications = data.applications

                    // Apply status filter
                    if (statusFilter !== "all") {
                        filteredApplications = filteredApplications.filter((app: Application) => app.status === statusFilter)
                    }

                    // Apply sorting
                    filteredApplications.sort((a: Application, b: Application) => {
                        if (sortBy === "newest") {
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        } else {
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        }
                    })

                    setApplications(filteredApplications)
                }
            } catch (error) {
                console.error("Error fetching applications:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchApplications()
    }, [token, statusFilter, sortBy])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">My Applications</h1>
                        <p className="text-gray-500">Manage your applications for support</p>
                    </div>

                    <Link href="/dashboard/applications/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Application
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                    </div>
                ) : applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <Link key={application._id} href={`/dashboard/applications/${application._id}`}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className={`p-3 rounded-full ${application.status === "approved"
                                                            ? "bg-green-100"
                                                            : application.status === "rejected"
                                                                ? "bg-red-100"
                                                                : "bg-yellow-100"
                                                        }`}
                                                >
                                                    <FileText
                                                        className={`h-6 w-6 ${application.status === "approved"
                                                                ? "text-green-600"
                                                                : application.status === "rejected"
                                                                    ? "text-red-600"
                                                                    : "text-yellow-600"
                                                            }`}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{application.title}</h3>
                                                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">{application.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div
                                                    className={`text-xs px-2 py-1 rounded-full ${application.status === "approved"
                                                            ? "bg-green-100 text-green-800"
                                                            : application.status === "rejected"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                >
                                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-2">
                                                    Submitted on {formatDate(application.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No applications found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            {statusFilter !== "all"
                                ? `You don't have any ${statusFilter} applications.`
                                : "You haven't submitted any applications yet."}
                        </p>
                        <Link href="/dashboard/applications/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Submit Your First Application
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default ApplicationsPage
