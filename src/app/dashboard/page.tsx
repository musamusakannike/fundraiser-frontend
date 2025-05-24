"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  FileText,
  Bell,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  UserCircle,
} from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"

interface Campaign {
  _id: string
  title: string
  status: string
  createdAt: string
}

interface Application {
  _id: string
  title: string
  status: string
  createdAt: string
}

interface Notification {
  _id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

interface DashboardStats {
  campaigns?: {
    total: number
    active: number
    completed: number
    cancelled: number
  }
  applications?: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  users?: {
    total: number
    admins: number
    superadmins: number
  }
}

const Dashboard = () => {
  const { user, token } = useAuth()
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([])
  const [userApplications, setUserApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState({
    campaigns: true,
    applications: true,
    notifications: true,
    stats: true,
  })

  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  useEffect(() => {
    const fetchActiveCampaigns = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/campaigns/active`)
        if (response.ok) {
          const data = await response.json()
          setActiveCampaigns(data.campaigns.slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching active campaigns:", error)
      } finally {
        setLoading((prev) => ({ ...prev, campaigns: false }))
      }
    }

    const fetchUserApplications = async () => {
      if (!token) return

      try {
        const response = await fetch(`${SERVER_URL}/api/applications/my-applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUserApplications(data.applications.slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching user applications:", error)
      } finally {
        setLoading((prev) => ({ ...prev, applications: false }))
      }
    }

    const fetchNotifications = async () => {
      if (!token) return

      try {
        const response = await fetch(`${SERVER_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications.slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading((prev) => ({ ...prev, notifications: false }))
      }
    }

    const fetchDashboardStats = async () => {
      if (!token || !isAdmin) {
        setLoading((prev) => ({ ...prev, stats: false }))
        return
      }

      try {
        const response = await fetch(`${SERVER_URL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading((prev) => ({ ...prev, stats: false }))
      }
    }

    fetchActiveCampaigns()
    fetchUserApplications()
    fetchNotifications()
    fetchDashboardStats()
  }, [token, isAdmin])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 m-4 p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="350" height="350" viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0,175 C0,78.3 78.3,0 175,0 C271.7,0 350,78.3 350,175 C350,271.7 271.7,350 175,350 C78.3,350 0,271.7 0,175 Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName}</h1>
            <p className="mt-2 text-emerald-100">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="bg-white text-emerald-800 hover:bg-emerald-50">
                <FileText className="mr-2 h-4 w-4" />
                New Application
              </Button>
              <Button variant="outline" className="border-white bg-transparent text-white hover:bg-white/20">
                <Heart className="mr-2 h-4 w-4" />
                View Campaigns
              </Button>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-none shadow-md pb-2">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 py-2">
                <CardTitle className="flex items-center text-lg font-semibold text-emerald-800">
                  <TrendingUp className="mr-2 h-5 w-5 text-emerald-600" />
                  Total Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading.stats ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-emerald-800">{stats.campaigns?.total || 0}</div>
                    <div className="text-sm text-emerald-600">
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        {stats.campaigns?.active || 0} Active
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md pb-2">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 py-2">
                <CardTitle className="flex items-center text-lg font-semibold text-emerald-800">
                  <FileText className="mr-2 h-5 w-5 text-emerald-600" />
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading.stats ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-bold text-emerald-800">{stats.applications?.total || 0}</div>
                      <div className="text-sm text-emerald-600">
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                          {stats.applications?.pending || 0} Pending
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-700">Approved</span>
                        <span className="font-medium text-emerald-700">{stats.applications?.approved || 0}</span>
                      </div>
                      <Progress
                        value={
                          stats.applications?.total ? (stats.applications.approved / stats.applications.total) * 100 : 0
                        }
                        className="h-1.5 bg-emerald-100"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md pb-2">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 py-2">
                <CardTitle className="flex items-center text-lg font-semibold text-emerald-800">
                  <Users className="mr-2 h-5 w-5 text-emerald-600" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading.stats ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold text-emerald-800">{stats.users?.total || 0}</div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-600">Admins:</span>
                        <span className="font-medium text-emerald-800">{stats.users?.admins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-600">Super:</span>
                        <span className="font-medium text-emerald-800">{stats.users?.superadmins || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md pb-2">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 py-2">
                <CardTitle className="flex items-center text-lg font-semibold text-emerald-800">
                  <Calendar className="mr-2 h-5 w-5 text-emerald-600" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading.stats ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-emerald-50 p-2 text-center">
                      <div className="text-xs font-medium text-emerald-600">Completed</div>
                      <div className="text-xl font-bold text-emerald-800">{stats.campaigns?.completed || 0}</div>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2 text-center">
                      <div className="text-xs font-medium text-red-600">Cancelled</div>
                      <div className="text-xl font-bold text-red-800">{stats.campaigns?.cancelled || 0}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Active Campaigns */}
          <Card className="border-none shadow-md pb-2">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-emerald-100 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold text-emerald-800">
                  <Heart className="mr-2 h-5 w-5 text-emerald-600" />
                  Active Campaigns
                </CardTitle>
                <Link href="/dashboard/campaigns">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading.campaigns ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : activeCampaigns.length > 0 ? (
                <div>
                  {activeCampaigns.map((campaign, index) => (
                    <Link key={campaign._id} href={`/dashboard/campaigns/${campaign._id}`}>
                      <div
                        className={`group flex items-start gap-3 p-4 transition-colors hover:bg-emerald-50 ${
                          index !== activeCampaigns.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                          <Heart className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 group-hover:text-emerald-700">{campaign.title}</h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 h-3.5 w-3.5" />
                            {formatDate(campaign.createdAt)}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No active campaigns</h3>
                  <p className="mt-1 text-sm text-gray-500">No active campaigns found at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Applications */}
          <Card className="border-none shadow-md pb-2">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-emerald-100 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold text-emerald-800">
                  <FileText className="mr-2 h-5 w-5 text-emerald-600" />
                  My Applications
                </CardTitle>
                <Link href="/dashboard/applications">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading.applications ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : userApplications.length > 0 ? (
                <div>
                  {userApplications.map((application, index) => (
                    <Link key={application._id} href={`/dashboard/applications/${application._id}`}>
                      <div
                        className={`group flex items-start gap-3 p-4 transition-colors hover:bg-emerald-50 ${
                          index !== userApplications.length - 1 ? "border-b" : ""
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
                          {application.status === "approved" ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : application.status === "rejected" ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 group-hover:text-emerald-700">
                              {application.title}
                            </h3>
                            <Badge className={`${getStatusColor(application.status)}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 h-3.5 w-3.5" />
                            {formatDate(application.createdAt)}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No applications</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven&apos;t submitted any applications yet.</p>
                  <Button variant="outline" className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="border-none shadow-md">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-emerald-100 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold text-emerald-800">
                  <Bell className="mr-2 h-5 w-5 text-emerald-600" />
                  Recent Notifications
                </CardTitle>
                <Link href="/dashboard/notifications">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading.notifications ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : notifications.length > 0 ? (
                <div>
                  {notifications.map((notification, index) => (
                    <Link key={notification._id} href={`/dashboard/notifications`}>
                      <div
                        className={`group flex items-start gap-3 p-4 transition-colors hover:bg-emerald-50 ${
                          !notification.isRead ? "bg-emerald-50" : ""
                        } ${index !== notifications.length - 1 ? "border-b" : ""}`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            !notification.isRead ? "bg-emerald-200 text-emerald-700" : "bg-emerald-100 text-emerald-600"
                          } group-hover:bg-emerald-200`}
                        >
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${
                              !notification.isRead ? "text-emerald-800" : "text-gray-900"
                            } group-hover:text-emerald-700`}
                          >
                            {notification.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{notification.message}</p>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(notification.createdAt)}
                          </div>
                        </div>
                        {!notification.isRead && <div className="h-2 w-2 rounded-full bg-emerald-500"></div>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <Bell className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">You&apos;re all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardTitle className="text-lg font-semibold text-emerald-800">Quick Actions</CardTitle>
            <CardDescription className="text-emerald-600">Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border border-emerald-100 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-emerald-100 p-3">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mb-2 font-medium text-gray-900">Browse Campaigns</h3>
                  <p className="mb-4 text-sm text-gray-500">View all active fundraising campaigns</p>
                  <Link href="/dashboard/campaigns" className="mt-auto w-full">
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      View Campaigns
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-emerald-100 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-emerald-100 p-3">
                    <FileText className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mb-2 font-medium text-gray-900">Submit Application</h3>
                  <p className="mb-4 text-sm text-gray-500">Create a new funding application</p>
                  <Link href="/dashboard/applications/new" className="mt-auto w-full">
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      New Application
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-emerald-100 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-emerald-100 p-3">
                    <UserCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mb-2 font-medium text-gray-900">Update Profile</h3>
                  <p className="mb-4 text-sm text-gray-500">Manage your account information</p>
                  <Link href="/dashboard/profile" className="mt-auto w-full">
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
