"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  FileText,
  Loader2,
  AlertTriangle,
  Calendar,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  Download,
  ExternalLink,
  MessageSquare,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [application?.messages])

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

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
            <p className="mt-4 text-emerald-800">Loading application details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-amber-100 p-4 mb-4">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            The application you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/dashboard/applications">
            <Button className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back button */}
        <div>
          <Link href="/dashboard/applications">
            <Button variant="ghost" className="pl-0 text-gray-500 hover:text-emerald-700 hover:bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>

        {/* Application Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 opacity-10">
            <svg width="350" height="350" viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0,175 C0,78.3 78.3,0 175,0 C271.7,0 350,78.3 350,175 C350,271.7 271.7,350 175,350 C78.3,350 0,271.7 0,175 Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-white/20 text-white border-white/10 hover:bg-white/30">
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{application.title}</h1>
                <div className="flex items-center gap-4 text-emerald-100">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Submitted on {formatShortDate(application.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Application Details</CardTitle>
                <CardDescription className="text-emerald-600">Information about your application</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{application.description}</p>
                </div>

                {application.additionalDetails && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Details</h3>
                      <p className="text-gray-700 whitespace-pre-line">{application.additionalDetails}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-xs text-gray-500">Full Name</div>
                        <div className="font-medium">{application.fullName}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="font-medium">{application.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {application.proofDocuments && application.proofDocuments.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Supporting Documents</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {application.proofDocuments.map((doc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                          >
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-emerald-600 mr-3" />
                              <span className="font-medium">Document {idx + 1}</span>
                            </div>
                            <div className="flex gap-2">
                              <a href={doc} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="h-8">
                                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                  View
                                </Button>
                              </a>
                              <a href={doc} download>
                                <Button variant="outline" size="sm" className="h-8">
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  Download
                                </Button>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Messages</CardTitle>
                <CardDescription className="text-emerald-600">Communication regarding your application</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 mb-6">
                  {application.messages && application.messages.length > 0 ? (
                    application.messages.map((message) => (
                      <div
                        key={message._id}
                        className={cn("flex gap-4", message.sender._id === user?._id ? "justify-end" : "justify-start")}
                      >
                        {message.sender._id !== user?._id && (
                          <Avatar
                            className={cn(
                              "h-9 w-9 border-2",
                              message.isAdminMessage
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-gray-100 text-gray-700 border-gray-200",
                            )}
                          >
                            <AvatarFallback>{getInitials(message.sender.fullName)}</AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-4",
                            message.sender._id === user?._id
                              ? "bg-emerald-600 text-white"
                              : message.isAdminMessage
                                ? "bg-emerald-50 border border-emerald-100 text-gray-800"
                                : "bg-gray-100 border border-gray-200 text-gray-800",
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={cn(
                                "text-xs font-medium",
                                message.sender._id === user?._id ? "text-emerald-100" : "text-gray-500",
                              )}
                            >
                              {message.sender._id === user?._id ? "You" : message.sender.fullName}
                              {message.isAdminMessage && message.sender._id !== user?._id && (
                                <span className="ml-2 text-xs text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Admin
                                </span>
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-xs",
                                message.sender._id === user?._id ? "text-emerald-100" : "text-gray-400",
                              )}
                            >
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                          <div className="whitespace-pre-line text-sm">{message.content}</div>
                        </div>

                        {message.sender._id === user?._id && (
                          <Avatar className="h-9 w-9 bg-emerald-600 text-white border-2 border-emerald-500">
                            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="rounded-full bg-gray-100 p-3 mb-3">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-700">No messages yet</h3>
                      <p className="text-xs text-gray-500 mt-1">Start the conversation by sending a message below.</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="mt-4">
                  <div className="space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="Type your message here..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="min-h-[100px] pr-12 border-gray-200 focus-visible:ring-emerald-500"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="absolute bottom-3 right-3"
                        disabled={sendingMessage || !messageContent.trim()}
                      >
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Application Status */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Status</CardTitle>
                <CardDescription className="text-emerald-600">Current status of your application</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  className={cn(
                    "p-4 rounded-lg border",
                    application.status === "approved"
                      ? "bg-emerald-50 border-emerald-100"
                      : application.status === "rejected"
                        ? "bg-red-50 border-red-100"
                        : "bg-amber-50 border-amber-100",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {application.status === "approved" ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : application.status === "rejected" ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-600" />
                    )}
                    <div className="font-medium">
                      {application.status === "approved"
                        ? "Approved"
                        : application.status === "rejected"
                          ? "Rejected"
                          : "Pending Review"}
                    </div>
                  </div>
                  <p className="text-sm mt-2 pl-8">
                    {application.status === "approved"
                      ? "Your application has been approved. Check messages for details."
                      : application.status === "rejected"
                        ? "Your application has been rejected. Check messages for feedback."
                        : "Your application is currently under review. We will notify you once a decision has been made."}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Application Timeline</h3>
                  <div className="relative border-l-2 border-gray-200 pl-6 pb-2 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[25px] h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Application Submitted</span>
                        <div className="text-xs text-gray-500 mt-1">{formatDate(application.createdAt)}</div>
                      </div>
                    </div>

                    {application.status !== "pending" && (
                      <div className="relative">
                        <div
                          className={cn(
                            "absolute -left-[25px] h-6 w-6 rounded-full flex items-center justify-center",
                            application.status === "approved" ? "bg-emerald-600" : "bg-red-600",
                          )}
                        >
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            {application.status === "approved" ? "Application Approved" : "Application Rejected"}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{formatDate(application.updatedAt)}</div>
                        </div>
                      </div>
                    )}

                    {application.status === "pending" && (
                      <div className="relative">
                        <div className="absolute -left-[25px] h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-400">Awaiting Decision</span>
                          <div className="text-xs text-gray-400 mt-1">Pending review by administrators</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Link href="/dashboard/applications">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View All Applications
                  </Button>
                </Link>

                <Link href="/dashboard/campaigns">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Campaigns
                  </Button>
                </Link>

                <Link href="/dashboard/applications/new">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Application
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
