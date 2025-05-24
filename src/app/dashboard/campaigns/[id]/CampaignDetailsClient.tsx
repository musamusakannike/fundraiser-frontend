"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Heart,
  FileText,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Calendar,
  User,
  Clock,
  ArrowLeft,
  BanknoteIcon as Bank,
  DollarSign,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SERVER_URL } from "@/constants"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  applications?: {
    _id: string
    title: string
    status: string
    createdAt: string
  }[]
}

interface Application {
  _id: string
  title: string
  status: string
  createdAt: string
}

export default function CampaignDetailsClient({ id }: { id: string }) {
  const { user, token } = useAuth()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [userApplications, setUserApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  useEffect(() => {
    const fetchCampaign = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${SERVER_URL}/api/campaigns/${id}`, {
          headers: token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {},
        })

        if (response.ok) {
          const data = await response.json()
          setCampaign(data.campaign)

          if (data.campaign.applications) {
            setUserApplications(data.campaign.applications)
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load campaign details",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching campaign:", error)
        toast({
          title: "Error",
          description: "Failed to load campaign details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [id, token, toast])

  const handleDeleteCampaign = async () => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`${SERVER_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        })
        router.push("/dashboard/campaigns")
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to delete campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`${SERVER_URL}/api/campaigns/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
        toast({
          title: "Success",
          description: `Campaign marked as ${newStatus} successfully`,
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || `Failed to update campaign status`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating campaign status:", error)
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const copyBankDetails = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Bank details copied to clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
            <p className="mt-4 text-emerald-800">Loading campaign details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-amber-100 p-4 mb-4">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            The campaign you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/dashboard/campaigns">
            <Button className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const hasApplied = userApplications.length > 0
  const canApply = campaign.status === "active" && user && !hasApplied

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back button */}
        <div>
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" className="pl-0 text-gray-500 hover:text-emerald-700 hover:bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>

        {/* Campaign Header */}
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
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/10 hover:bg-white/30">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatCurrency(campaign.amountNeeded)}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{campaign.title}</h1>
                <div className="flex items-center gap-4 text-emerald-100">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{campaign.createdBy.fullName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(campaign.createdAt)}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Link href={`/dashboard/campaigns/${id}/edit`}>
                    <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
                    onClick={handleDeleteCampaign}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {canApply && (
              <div className="mt-6">
                <Link href={`/dashboard/applications/new?campaign=${campaign._id}`}>
                  <Button className="bg-white text-emerald-800 hover:bg-emerald-50">
                    <FileText className="h-4 w-4 mr-2" />
                    Apply for Support
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Content */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="donate"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Donate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Campaign Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campaign.images && campaign.images.length > 0 ? (
                campaign.images.map((image, index) => (
                  <Card key={index} className="overflow-hidden border-none shadow-md">
                    <div className="aspect-video bg-gray-100">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${campaign.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={500}
                        height={300}
                      />
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="overflow-hidden border-none shadow-md col-span-full">
                  <div className="aspect-video flex items-center justify-center bg-emerald-50">
                    <Heart className="h-16 w-16 text-emerald-200" />
                  </div>
                </Card>
              )}
            </div>

            {/* Campaign Description */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">About This Campaign</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-gray-700">{campaign.description}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t p-6 bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount Needed</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(campaign.amountNeeded)}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  {canApply && (
                    <Link href={`/dashboard/applications/new?campaign=${campaign._id}`}>
                      <Button className="w-full sm:w-auto">
                        <FileText className="h-4 w-4 mr-2" />
                        Apply for Support
                      </Button>
                    </Link>
                  )}

                  {hasApplied && (
                    <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-md text-sm text-emerald-700">
                      <CheckCircle className="h-4 w-4 inline-block mr-2" />
                      You have already applied
                    </div>
                  )}

                  {!user && (
                    <Link href="/login">
                      <Button variant="outline" className="w-full sm:w-auto">
                        Login to Apply
                      </Button>
                    </Link>
                  )}

                  {campaign.status !== "active" && (
                    <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-700">
                      <Clock className="h-4 w-4 inline-block mr-2" />
                      No longer accepting applications
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Admin Actions */}
            {isAdmin && campaign.status === "active" && (
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                  <CardTitle className="text-lg font-semibold text-emerald-800">Admin Actions</CardTitle>
                  <CardDescription className="text-emerald-600">Manage the status of this campaign</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleUpdateStatus("completed")}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Mark as Completed
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => handleUpdateStatus("cancelled")}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Mark as Cancelled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isAdmin && campaign.status !== "active" && (
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                  <CardTitle className="text-lg font-semibold text-emerald-800">Admin Actions</CardTitle>
                  <CardDescription className="text-emerald-600">Manage the status of this campaign</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Button
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleUpdateStatus("active")}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Reactivate Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="donate" className="space-y-6 mt-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Donation Information</CardTitle>
                <CardDescription className="text-emerald-600">
                  Bank details for making donations to this campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-emerald-50 rounded-lg border border-emerald-100 overflow-hidden">
                  <div className="p-4 bg-emerald-100/50 border-b border-emerald-100 flex items-center">
                    <Bank className="h-5 w-5 mr-2 text-emerald-700" />
                    <h3 className="font-medium text-emerald-800">Bank Transfer Details</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Bank Name</p>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900">{campaign.bankName}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 ml-2 text-gray-500 hover:text-emerald-700"
                                  onClick={() => copyBankDetails(campaign.bankName)}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Copy bank name</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy bank name</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Account Number</p>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900 tracking-wider">{campaign.bankAccountNumber}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 ml-2 text-gray-500 hover:text-emerald-700"
                                  onClick={() => copyBankDetails(campaign.bankAccountNumber)}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Copy account number</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy account number</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Account Name</p>
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900">{campaign.bankAccountName}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 ml-2 text-gray-500 hover:text-emerald-700"
                                  onClick={() => copyBankDetails(campaign.bankAccountName)}
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="sr-only">Copy account name</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy account name</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Amount Needed</p>
                        <p className="font-medium text-emerald-700">{formatCurrency(campaign.amountNeeded)}</p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        className="flex-1 sm:flex-initial"
                        onClick={() =>
                          copyBankDetails(
                            `Bank: ${campaign.bankName}\nAccount Number: ${campaign.bankAccountNumber}\nAccount Name: ${campaign.bankAccountName}`,
                          )
                        }
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All Bank Details
                      </Button>
                      <Button variant="outline" className="flex-1 sm:flex-initial">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Campaign
                      </Button>
                    </div>
                  </div>
                </div>

                <Card className="border border-amber-100 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-2">Important Note:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Please include the campaign title as reference when making your donation.</li>
                          <li>After making your donation, you may contact the campaign creator for confirmation.</li>
                          <li>All donations are voluntary and non-refundable.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>
    </DashboardLayout>
  )
}
