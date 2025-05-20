"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Bell, CheckCircle, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-gray-500">
              {getUnreadCount() > 0
                ? `You have ${getUnreadCount()} unread notification${getUnreadCount() > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>

          {notifications.length > 0 && getUnreadCount() > 0 && (
            <Button variant="outline" onClick={markAllAsRead} disabled={markingAllRead}>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification._id}
                className={`hover:shadow-sm transition-shadow ${
                  !notification.isRead ? "bg-emerald-50 border-emerald-200" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${!notification.isRead ? "bg-emerald-100" : "bg-gray-100"}`}>
                      <Bell className={`h-5 w-5 ${!notification.isRead ? "text-emerald-600" : "text-gray-500"}`} />
                    </div>

                    <div className="flex-1">
                      <Link
                        href={getNotificationLink(notification)}
                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                      >
                        <div className="cursor-pointer">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">{notification.title}</h3>
                            <div className="text-sm text-gray-500">{formatDate(notification.createdAt)}</div>
                          </div>
                          <p className="text-gray-600 mt-1 whitespace-pre-line">{notification.message}</p>
                        </div>
                      </Link>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-500">
                          From: {notification.sender ? notification.sender.fullName : "System"}
                        </div>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button variant="outline" size="sm" onClick={() => markAsRead(notification._id)}>
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
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You don't have any notifications at the moment. We'll notify you when there are updates on your
              applications or campaigns.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default NotificationsPage
