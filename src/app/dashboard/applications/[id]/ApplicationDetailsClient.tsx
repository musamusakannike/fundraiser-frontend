"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  _id: string
  sender: {
    _id: string
    fullName: string
    role: string
  }
  content: string
  isAdminMessage: boolean
  createdAt: string
}

interface Application {
  _id: string
  title: string
  description: string
  proofDocuments: string[]
  fullName: string
  email: string
  additionalDetails: string
  status: string
  user: {
    _id: string
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt: string
  messages: Message[]
}

type Props = { id: string }

export default function ApplicationDetailsClient({ id }: Props) {
  const { user, token } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageContent, setMessageContent] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchApplication = async () => {
      if (!token) return
      setLoading(true)
      try {
        const response = await fetch(`${SERVER_URL}/api/applications/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setApplication(data.application)
        } else {
          toast({
            title: "Error",
            description: "Failed to load application details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching application:", error)
        toast({
          title: "Error",
          description: "Failed to load application details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchApplication()
  }, [id, token, toast])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim()) return
    setSendingMessage(true)
    try {
      const response = await fetch(`${SERVER_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: messageContent,
          application: id,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setApplication((prev) => {
          if (!prev) return prev
          const newMessage = {
            _id: data.data._id,
            sender: {
              _id: user?._id || "",
              fullName: user?.fullName || "",
              role: user?.role || "user",
            },
            content: data.data.content,
            isAdminMessage: data.data.isAdminMessage,
            createdAt: data.data.createdAt,
          }
          return {
            ...prev,
            messages: [...prev.messages, newMessage],
          }
        })
        setMessageContent("")
        toast({
          title: "Success",
          description: "Message sent successfully",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to send message",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-gray-500 mb-6">The application you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/dashboard/applications">
            <Button>Back to Applications</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{application.title}</h1>
              <Badge
                className={
                  application.status === "approved"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : application.status === "rejected"
                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                }
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-500">Submitted on {formatDate(application.createdAt)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 whitespace-pre-line">{application.description}</p>
                </div>

                {application.additionalDetails && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Additional Details</h3>
                    <p className="mt-1 whitespace-pre-line">{application.additionalDetails}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Full Name:</span> {application.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {application.email}
                    </div>
                  </div>
                </div>

                {application.proofDocuments && application.proofDocuments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Proof Documents</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {application.proofDocuments.map((doc, idx) => (
                        <li key={idx}>
                          <a href={doc} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">
                            View Document {idx + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {application.status === "approved" && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                    <span className="font-medium text-green-700">This application has been approved.</span>
                  </div>
                )}

                {application.status === "rejected" && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <span className="font-medium text-red-700">This application has been rejected.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                  {application.messages && application.messages.length > 0 ? (
                    application.messages.map((message) => (
                      <div
                        key={message._id}
                        className={`rounded-lg p-3 ${message.isAdminMessage ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50 border"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.sender.fullName}</span>
                          <span className="text-xs text-gray-400">{formatDate(message.createdAt)}</span>
                          {message.isAdminMessage && (
                            <span className="ml-2 text-xs text-emerald-700 font-semibold">Admin</span>
                          )}
                        </div>
                        <div className="text-sm whitespace-pre-line">{message.content}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center">No messages yet.</div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="mt-4">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your message here..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button type="submit" className="w-full" disabled={sendingMessage || !messageContent.trim()}>
                      {sendingMessage ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`p-4 rounded-lg ${
                    application.status === "approved"
                      ? "bg-green-50 border border-green-100"
                      : application.status === "rejected"
                        ? "bg-red-50 border border-red-100"
                        : "bg-yellow-50 border border-yellow-100"
                  }`}
                >
                  <div className="font-medium mb-1">
                    {application.status === "approved"
                      ? "Approved"
                      : application.status === "rejected"
                        ? "Rejected"
                        : "Pending Review"}
                  </div>
                  <p className="text-sm">
                    {application.status === "approved"
                      ? "Your application has been approved. Check messages for details."
                      : application.status === "rejected"
                        ? "Your application has been rejected. Check messages for feedback."
                        : "Your application is currently under review. We will notify you once a decision has been made."}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-4 w-4 rounded-full bg-emerald-500 mt-1"></div>
                      <div className="ml-3">
                        <span className="font-medium">Submitted</span>
                        <div className="text-xs text-gray-500">{formatDate(application.createdAt)}</div>
                      </div>
                    </div>

                    {application.status !== "pending" && (
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-4 w-4 rounded-full ${application.status === "approved" ? "bg-green-500" : "bg-red-500"} mt-1`}></div>
                        <div className="ml-3">
                          <span className="font-medium">{application.status === "approved" ? "Approved" : "Rejected"}</span>
                          <div className="text-xs text-gray-500">{formatDate(application.updatedAt)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/applications">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Applications
                  </Button>
                </Link>

                <Link href="/dashboard/campaigns">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Campaigns
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
