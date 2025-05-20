"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Filter, ArrowUpDown, Calendar, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { SERVER_URL } from "@/constants"
import { Badge } from "@/components/ui/badge"

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
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

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

          // Calculate stats
          const total = filteredApplications.length
          const pending = filteredApplications.filter((app: Application) => app.status === "pending").length
          const approved = filteredApplications.filter((app: Application) => app.status === "approved").length
          const rejected = filteredApplications.filter((app: Application) => app.status === "rejected").length

          setStats({
            total,
            pending,
            approved,
            rejected,
          })

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-amber-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-amber-100 text-amber-800 border-amber-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="350" height="350" viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0,175 C0,78.3 78.3,0 175,0 C271.7,0 350,78.3 350,175 C350,271.7 271.7,350 175,350 C78.3,350 0,271.7 0,175 Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
              <p className="mt-2 text-emerald-100">Manage your applications for support</p>
            </div>

            <Link href="/dashboard/applications/new">
              <Button className="bg-white text-emerald-800 hover:bg-emerald-50">
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {!loading && stats.total > 0 && (
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Total Applications</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                  <div className="text-sm text-amber-700 mb-1">Pending</div>
                  <div className="text-2xl font-bold text-amber-800">{stats.pending}</div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                  <div className="text-sm text-emerald-700 mb-1">Approved</div>
                  <div className="text-2xl font-bold text-emerald-800">{stats.approved}</div>
                </div>
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="text-sm text-red-700 mb-1">Rejected</div>
                  <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Application Status Distribution</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    {/* Approved */}
                    {stats.approved > 0 && (
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${(stats.approved / stats.total) * 100}%`,
                        }}
                      />
                    )}
                    {/* Pending */}
                    {stats.pending > 0 && (
                      <div
                        className="bg-amber-500 h-full"
                        style={{
                          width: `${(stats.pending / stats.total) * 100}%`,
                        }}
                      />
                    )}
                    {/* Rejected */}
                    {stats.rejected > 0 && (
                      <div
                        className="bg-red-500 h-full"
                        style={{
                          width: `${(stats.rejected / stats.total) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1"></div>
                      <span>Approved ({stats.approved})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                      <span>Pending ({stats.pending})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                      <span>Rejected ({stats.rejected})</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
                  <Filter className="h-4 w-4" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="pl-9 border-emerald-200 focus:ring-emerald-500">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="pl-9 border-emerald-200 focus:ring-emerald-500">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
              <p className="mt-4 text-emerald-800">Loading applications...</p>
            </div>
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4 w-full flex flex-col">
            {applications.map((application) => (
              <Link key={application._id} href={`/dashboard/applications/${application._id}`}>
                <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                        {getStatusIcon(application.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-emerald-700 transition-colors">
                          {application.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mt-1">{application.description}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${getStatusColor(application.status)} border`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(application.createdAt)}
                        </div>
                      </div>
                      
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600 hidden md:block" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-none shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-emerald-100 p-4 mb-4">
                <FileText className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900">No applications found</h3>
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
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ApplicationsPage
