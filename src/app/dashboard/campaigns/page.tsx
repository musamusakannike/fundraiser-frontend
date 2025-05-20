"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Plus, Search, Loader2, Filter, ArrowUpDown, Calendar, Coins } from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Campaign {
  _id: string
  title: string
  description: string
  images: string[]
  amountNeeded: number
  bankAccountNumber: string
  bankAccountName: string
  bankName: string
  status: string
  createdBy: {
    _id: string
    fullName: string
  }
  createdAt: string
  updatedAt: string
}

const CampaignsPage = () => {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      try {
        let url = `${SERVER_URL}/api/campaigns?`

        if (searchTerm) {
          url += `search=${encodeURIComponent(searchTerm)}&`
        }

        if (statusFilter && statusFilter !== "all") {
          url += `status=${statusFilter}&`
        }

        if (sortBy) {
          url += `sort=${sortBy}`
        }

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data.campaigns)
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [searchTerm, statusFilter, sortBy])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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
              <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
              <p className="mt-2 text-emerald-100">Browse and apply for fundraising campaigns</p>
            </div>

            {isAdmin && (
              <Link href="/dashboard/campaigns/new">
                <Button className="bg-white text-emerald-800 hover:bg-emerald-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-9 border-emerald-200 focus-visible:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                    <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              <p className="mt-4 text-emerald-800">Loading campaigns...</p>
            </div>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link key={campaign._id} href={`/dashboard/campaigns/${campaign._id}`}>
                <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-video relative bg-gray-100">
                    {campaign.images && campaign.images.length > 0 ? (
                      <Image
                        src={campaign.images[0] || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        width={500}
                        height={300}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <Heart className="h-12 w-12 text-emerald-200" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getStatusBadgeStyles(campaign.status)} border`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center text-sm">
                        <Coins className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="font-medium text-emerald-700">{formatCurrency(campaign.amountNeeded)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{formatDate(campaign.createdAt)}</span>
                      </div>
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
                <Heart className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-gray-900">No campaigns found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "There are no campaigns available at the moment. Please check back later."}
              </p>
              {isAdmin && (
                <Link href="/dashboard/campaigns/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Campaign
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default CampaignsPage;
