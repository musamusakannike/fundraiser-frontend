"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Plus, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"

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
  const { user, token } = useAuth()
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-gray-500">Browse and apply for fundraising campaigns</p>
          </div>

          {isAdmin && (
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search campaigns..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Link key={campaign._id} href={`/dashboard/campaigns/${campaign._id}`}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <div className="aspect-video relative bg-gray-100">
                    {campaign.images && campaign.images.length > 0 ? (
                      <img
                        src={campaign.images[0] || "/placeholder.svg"}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <Heart className="h-12 w-12 text-emerald-200" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-800"
                            : campaign.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{campaign.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{campaign.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="font-medium text-emerald-700">{formatCurrency(campaign.amountNeeded)}</div>
                      <div className="text-gray-500">{formatDate(campaign.createdAt)}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "There are no campaigns available at the moment. Please check back later."}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default CampaignsPage
