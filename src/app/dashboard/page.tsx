"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, FileText, Bell, Loader2 } from "lucide-react"
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {user?.fullName}</p>
                </div>

                {isAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Campaigns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading.stats ? (
                                    <div className="flex justify-center py-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold">{stats.campaigns?.total || 0}</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Active Campaigns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading.stats ? (
                                    <div className="flex justify-center py-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold">{stats.campaigns?.active || 0}</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading.stats ? (
                                    <div className="flex justify-center py-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold">{stats.applications?.total || 0}</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Pending Applications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading.stats ? (
                                    <div className="flex justify-center py-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold">{stats.applications?.pending || 0}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Campaigns */}
                    <Card className="col-span-1">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <Heart className="h-5 w-5 mr-2 text-emerald-600" />
                                    Active Campaigns
                                </CardTitle>
                                <Link href="/dashboard/campaigns">
                                    <Button variant="ghost" size="sm" className="text-emerald-600">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading.campaigns ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                </div>
                            ) : activeCampaigns.length > 0 ? (
                                <div className="space-y-4">
                                    {activeCampaigns.map((campaign) => (
                                        <Link key={campaign._id} href={`/dashboard/campaigns/${campaign._id}`}>
                                            <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="font-medium">{campaign.title}</div>
                                                <div className="text-sm text-gray-500 mt-1">Created on {formatDate(campaign.createdAt)}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No active campaigns found</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* My Applications */}
                    <Card className="col-span-1">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                                    My Applications
                                </CardTitle>
                                <Link href="/dashboard/applications">
                                    <Button variant="ghost" size="sm" className="text-emerald-600">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading.applications ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                </div>
                            ) : userApplications.length > 0 ? (
                                <div className="space-y-4">
                                    {userApplications.map((application) => (
                                        <Link key={application._id} href={`/dashboard/applications/${application._id}`}>
                                            <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between">
                                                    <div className="font-medium">{application.title}</div>
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
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    Submitted on {formatDate(application.createdAt)}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No applications found</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Notifications */}
                    <Card className="col-span-1">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-semibold flex items-center">
                                    <Bell className="h-5 w-5 mr-2 text-emerald-600" />
                                    Recent Notifications
                                </CardTitle>
                                <Link href="/dashboard/notifications">
                                    <Button variant="ghost" size="sm" className="text-emerald-600">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading.notifications ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="space-y-4">
                                    {notifications.map((notification) => (
                                        <Link key={notification._id} href={`/dashboard/notifications`}>
                                            <div
                                                className={`p-3 border rounded-lg hover:bg-gray-50 transition-colors ${!notification.isRead ? "bg-emerald-50 border-emerald-200" : ""
                                                    }`}
                                            >
                                                <div className="font-medium">{notification.title}</div>
                                                <div className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</div>
                                                <div className="text-xs text-gray-500 mt-1">{formatDate(notification.createdAt)}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No notifications found</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks you might want to perform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/dashboard/campaigns">
                                <Button variant="outline" className="w-full">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Browse Campaigns
                                </Button>
                            </Link>
                            <Link href="/dashboard/applications/new">
                                <Button variant="outline" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Submit Application
                                </Button>
                            </Link>
                            <Link href="/dashboard/profile">
                                <Button variant="outline" className="w-full">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Update Profile
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default Dashboard
