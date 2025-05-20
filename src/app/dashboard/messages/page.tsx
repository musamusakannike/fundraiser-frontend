"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Send, Search, Loader2, FileText } from "lucide-react"
import { SERVER_URL } from "@/constants"

interface Sender {
  _id: string
  fullName: string
  role: string
}

interface Message {
  _id: string
  sender: Sender
  content: string
  isAdminMessage: boolean
  createdAt: string
}

interface Application {
  _id: string
  title: string
  status: string
  messages: Message[]
  updatedAt: string
}

interface Conversation {
  application: Application
  lastMessage: Message
  unreadCount: number
}

const MessagesPage = () => {
  const { user, token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterBy, setFilterBy] = useState("all")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Fetch all applications with messages
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

          // Create conversations from applications that have messages
          const conversationsData: Conversation[] = data.applications
            .filter((app: Application) => app.messages && app.messages.length > 0)
            .map((app: Application) => {
              const messages = app.messages || []
              const lastMessage = messages[messages.length - 1]

              // Count unread messages (assuming we'd have a way to track read status)
              // For now, we'll just simulate this with a random number
              const unreadCount = 0 // This would be calculated based on message read status

              return {
                application: app,
                lastMessage,
                unreadCount,
              }
            })
            .sort((a: Conversation, b: Conversation) => {
              return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
            })

          setConversations(conversationsData)
          setFilteredConversations(conversationsData)

          // Select the first conversation by default if available
          if (conversationsData.length > 0 && !selectedConversation) {
            setSelectedConversation(conversationsData[0])
          }
        }
      } catch (error) {
        console.error("Error fetching applications with messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [token, toast, selectedConversation])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...conversations]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (conv) =>
          conv.application.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter((conv) => conv.application.status === filterBy)
    }

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.lastMessage.createdAt).getTime() - new Date(b.lastMessage.createdAt).getTime())
    }

    setFilteredConversations(filtered)
  }, [conversations, searchTerm, sortBy, filterBy])

  // Scroll to bottom of messages when conversation changes or new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageContent.trim() || !selectedConversation || !token) return

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
          application: selectedConversation.application._id,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Create the new message object
        const newMessage: Message = {
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

        // Update the selected conversation with the new message
        setSelectedConversation((prev) => {
          if (!prev) return prev

          const updatedMessages = [...prev.application.messages, newMessage]

          return {
            ...prev,
            application: {
              ...prev.application,
              messages: updatedMessages,
            },
            lastMessage: newMessage,
          }
        })

        // Also update the conversation in the list
        setConversations((prevConversations) => {
          return prevConversations.map((conv) => {
            if (conv.application._id === selectedConversation.application._id) {
              const updatedMessages = [...conv.application.messages, newMessage]

              return {
                ...conv,
                application: {
                  ...conv.application,
                  messages: updatedMessages,
                },
                lastMessage: newMessage,
              }
            }
            return conv
          })
        })

        setMessageContent("")

        // Scroll to the bottom after sending a message
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)

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
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      // Today - show time only
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      // Yesterday
      return "Yesterday"
    } else if (diffInDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      // Older - show date
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-500">View and manage your conversations</p>
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(80vh-2rem)]">
            {/* Conversations List */}
            <div className="border-r">
              <div className="p-4 border-b">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterBy} onValueChange={setFilterBy}>
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
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(80vh-8rem)]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.application._id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.application._id === conversation.application._id ? "bg-emerald-50" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium line-clamp-1">{conversation.application.title}</h3>
                        <span className="text-xs text-gray-500">{formatDate(conversation.lastMessage.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {conversation.lastMessage.sender.fullName}: {conversation.lastMessage.content}
                        </p>
                        <Badge className={getStatusColor(conversation.application.status)}>
                          {conversation.application.status.charAt(0).toUpperCase() +
                            conversation.application.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="font-medium text-gray-700">No conversations found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm || filterBy !== "all"
                        ? "Try adjusting your search or filters"
                        : "You don't have any message threads yet"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Detail */}
            <div className="col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold">{selectedConversation.application.title}</h2>
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-3 w-3 mr-1" />
                        <span>Application Status: </span>
                        <Badge className={`ml-1 ${getStatusColor(selectedConversation.application.status)}`}>
                          {selectedConversation.application.status.charAt(0).toUpperCase() +
                            selectedConversation.application.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.application.messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.isAdminMessage ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isAdminMessage ? "bg-gray-100 text-gray-800" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.sender.fullName}
                              {message.isAdminMessage && (
                                <Badge className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
                              )}
                            </span>
                          </div>
                          <p className="whitespace-pre-line">{message.content}</p>
                          <div className="text-right mt-1">
                            <span className="text-xs opacity-70">{formatMessageTime(message.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Textarea
                        placeholder="Type your message here..."
                        className="min-h-[60px] resize-none"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                      />
                      <Button type="submit" className="self-end" disabled={sendingMessage || !messageContent.trim()}>
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">No conversation selected</h3>
                  <p className="text-gray-500 mt-2 max-w-md">
                    Select a conversation from the list to view messages or start a new conversation by applying to a
                    campaign.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default MessagesPage;
