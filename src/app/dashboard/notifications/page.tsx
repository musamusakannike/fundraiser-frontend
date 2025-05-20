"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Bell, CheckCircle, Trash2, Loader2, ArrowRight, Calendar, Info, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface Notification {
  _id: string
  recipient: string
  sender: {
    _id: string
    fullName: string
  }
  type: string
  title: string
  message: string
  relatedTo: {
    model: string
    id: string
  }
  isRead: boolean
  createdAt: string
}

const NotificationsPage = () => {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return

      setLoading(true)
      try {
        const response = await fetch(`${SERVER_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [token, toast])

  const markAsRead = async (id: string) => {
    if (!token) return

    try {
      const response = await fetch(`${SERVER_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => (notification._id === id ? { ...notification, isRead: true } : notification)),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!token) return

    setMarkingAllRead(true)
    try {
      const response = await fetch(`${SERVER_URL}/api/notifications/mark-all-read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
        toast({
          title: "Success",
          description: "All notifications marked as read",
        })
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    } finally {
      setMarkingAllRead(false)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!token) return

    try {
      const response = await fetch(`${SERVER_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((notification) => notification._id !== id))
        toast({
          title: "Success",
          description: "Notification deleted",
        })
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
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

  const getNotificationLink = (notification: Notification) => {
    if (notification.relatedTo && notification.relatedTo.model) {
      switch (notification.relatedTo.model) {
        case "Application":
          return `/dashboard/applications/${notification.relatedTo.id}`
        case "Campaign":
          return `/dashboard/campaigns/${notification.relatedTo.id}`
        case "Message":
          // For messages, we need to navigate to the related application
          return `/dashboard/applications/${notification.relatedTo.id}`
        default:
          return "#"
      }
    }
    return "#"
  }

  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.isRead).length
  }

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((notification) => !notification.isRead)
      case "read":
        return notifications.filter((notification) => notification.isRead)
      default:
        return notifications
    }
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "application":
        return <Info className="h-5 w-5 text-blue-600" />
      case "campaign":
        return <Bell className="h-5 w-5 text-emerald-600" />
      case "message":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      default:
        return <Bell className="h-5 w-5 text-emerald-600" />
    }
  }

  const filteredNotifications = getFilteredNotifications()

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
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="mt-2 text-emerald-100">
                {getUnreadCount() > 0
                  ? `You have ${getUnreadCount()} unread notification${getUnreadCount() > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>

            {notifications.length > 0 && getUnreadCount() > 0 && (
              <Button
                className="bg-white text-emerald-800 hover:bg-emerald-50"
                onClick={markAllAsRead}
                disabled={markingAllRead}
              >
                {markingAllRead ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Marking all as read...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All as Read
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Notification Stats */}
        {!loading && notifications.length > 0 && (
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Total Notifications</div>
                  <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                  <div className="text-sm text-emerald-700 mb-1">Read</div>
                  <div className="text-2xl font-bold text-emerald-800">
                    {notifications.filter((n) => n.isRead).length}
                  </div>
                </div>
                <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                  <div className="text-sm text-amber-700 mb-1">Unread</div>
                  <div className="text-2xl font-bold text-amber-800">{getUnreadCount()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
            <CardTitle className="text-lg font-semibold text-emerald-800">Your Notifications</CardTitle>
            <CardDescription className="text-emerald-600">
              Stay updated with the latest information about your applications and campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                >
                  Unread ({getUnreadCount()})
                </TabsTrigger>
                <TabsTrigger
                  value="read"
                  className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
                >
                  Read ({notifications.filter((n) => n.isRead).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {renderNotificationsList(filteredNotifications)}
              </TabsContent>
              <TabsContent value="unread" className="mt-0">
                {renderNotificationsList(filteredNotifications)}
              </TabsContent>
              <TabsContent value="read" className="mt-0">
                {renderNotificationsList(filteredNotifications)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )

  function renderNotificationsList(notificationsList: Notification[]) {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
            <p className="mt-4 text-emerald-800">Loading notifications...</p>
          </div>
        </div>
      )
    }

    if (notificationsList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-emerald-100 p-4 mb-4">
            <Bell className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-gray-900">No notifications</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeTab === "unread"
              ? "You don't have any unread notifications."
              : activeTab === "read"
                ? "You don't have any read notifications."
                : "You don't have any notifications at the moment. We'll notify you when there are updates on your applications or campaigns."}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {notificationsList.map((notification) => (
          <Card
            key={notification._id}
            className={`hover:shadow-md transition-shadow ${
              !notification.isRead ? "bg-emerald-50 border-emerald-200" : "border-gray-200"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    !notification.isRead ? "bg-emerald-100" : "bg-gray-100"
                  }`}
                >
                  {getNotificationTypeIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                  >
                    <div className="cursor-pointer">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="font-semibold text-lg">{notification.title}</h3>
                        <div className="flex items-center">
                          {!notification.isRead && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mr-2">New</Badge>
                          )}
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2 whitespace-pre-line">{notification.message}</p>
                    </div>
                  </Link>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      From: {notification.sender ? notification.sender.fullName : "System"}
                    </div>
                    <div className="flex gap-2">
                      <Link href={getNotificationLink(notification)}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => markAsRead(notification._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => deleteNotification(notification._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-1">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}

export default NotificationsPage
