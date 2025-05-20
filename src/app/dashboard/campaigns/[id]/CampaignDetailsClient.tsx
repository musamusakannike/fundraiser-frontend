"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Heart, FileText, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Loader2, Copy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SERVER_URL } from "@/constants"
import Image from "next/image"

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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                </div>
            </DashboardLayout>
        )
    }

    if (!campaign) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
                    <p className="text-gray-500 mb-6">The campaign you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Link href="/dashboard/campaigns">
                        <Button>Back to Campaigns</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    const hasApplied = userApplications.length > 0
    const canApply = campaign.status === "active" && user && !hasApplied

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{campaign.title}</h1>
                            <Badge
                                className={
                                    campaign.status === "active"
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : campaign.status === "cancelled"
                                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                                            : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                }
                            >
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                        </div>
                        <p className="text-gray-500">
                            Created by {campaign.createdBy.fullName} on {formatDate(campaign.createdAt)}
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2">
                            <Link href={`/dashboard/campaigns/${id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button variant="destructive" onClick={handleDeleteCampaign} disabled={deleting}>
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

                <Tabs defaultValue="details">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="donate">Donate</TabsTrigger>
                        {isAdmin && <TabsTrigger value="applications">Applications</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        {/* Campaign Images */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {campaign.images && campaign.images.length > 0 ? (
                                campaign.images.map((image, index) => (
                                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={image || "/placeholder.svg"}
                                            alt={`${campaign.title} - Image ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            width={500}
                                            height={300}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="aspect-video rounded-lg flex items-center justify-center bg-emerald-50">
                                    <Heart className="h-12 w-12 text-emerald-200" />
                                </div>
                            )}
                        </div>

                        {/* Campaign Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Campaign</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-line">{campaign.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-6">
                                <div>
                                    <p className="text-sm text-gray-500">Amount Needed</p>
                                    <p className="text-xl font-bold text-emerald-700">{formatCurrency(campaign.amountNeeded)}</p>
                                </div>

                                {canApply && (
                                    <Link href={`/dashboard/applications/new?campaign=${campaign._id}`}>
                                        <Button>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Apply for Support
                                        </Button>
                                    </Link>
                                )}

                                {hasApplied && (
                                    <div className="text-sm text-gray-500 italic">You have already applied for this campaign</div>
                                )}

                                {!user && (
                                    <Link href="/login">
                                        <Button>Login to Apply</Button>
                                    </Link>
                                )}

                                {campaign.status !== "active" && (
                                    <div className="text-sm text-gray-500 italic">This campaign is no longer accepting applications</div>
                                )}
                            </CardFooter>
                        </Card>

                        {/* Admin Actions */}
                        {isAdmin && campaign.status === "active" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Actions</CardTitle>
                                    <CardDescription>Manage the status of this campaign</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            className="border-green-200 text-green-700 hover:bg-green-50"
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Actions</CardTitle>
                                    <CardDescription>Manage the status of this campaign</CardDescription>
                                </CardHeader>
                                <CardContent>
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

                    <TabsContent value="donate" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Donation Information</CardTitle>
                                <CardDescription>Bank details for making donations to this campaign</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Bank Name</p>
                                            <div className="flex items-center mt-1">
                                                <p className="font-medium">{campaign.bankName}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 ml-2"
                                                    onClick={() => copyBankDetails(campaign.bankName)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    <span className="sr-only">Copy bank name</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Account Number</p>
                                            <div className="flex items-center mt-1">
                                                <p className="font-medium">{campaign.bankAccountNumber}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 ml-2"
                                                    onClick={() => copyBankDetails(campaign.bankAccountNumber)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    <span className="sr-only">Copy account number</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Account Name</p>
                                            <div className="flex items-center mt-1">
                                                <p className="font-medium">{campaign.bankAccountName}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 ml-2"
                                                    onClick={() => copyBankDetails(campaign.bankAccountName)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    <span className="sr-only">Copy account name</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Amount Needed</p>
                                            <p className="font-medium mt-1">{formatCurrency(campaign.amountNeeded)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Button
                                        className="w-full md:w-auto"
                                        onClick={() =>
                                            copyBankDetails(
                                                `Bank: ${campaign.bankName}\nAccount Number: ${campaign.bankAccountNumber}\nAccount Name: ${campaign.bankAccountName}`,
                                            )
                                        }
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy All Bank Details
                                    </Button>
                                </div>

                                <div className="text-sm text-gray-500 mt-4">
                                    <p className="font-medium mb-2">Important Note:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Please include the campaign title as reference when making your donation.</li>
                                        <li>After making your donation, you may contact the campaign creator for confirmation.</li>
                                        <li>All donations are voluntary and non-refundable.</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="applications" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Applications</CardTitle>
                                    <CardDescription>Manage applications for this campaign</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {campaign.applications && campaign.applications.length > 0 ? (
                                        <div className="space-y-4">
                                            {campaign.applications.map((application) => (
                                                <Link key={application._id} href={`/dashboard/admin/applications/${application._id}`}>
                                                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-medium">{application.title}</p>
                                                                <p className="text-xs text-gray-500">{formatDate(application.createdAt)}</p>
                                                            </div>
                                                            <Badge
                                                                className={
                                                                    application.status === "pending"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : application.status === "approved"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-red-100 text-red-800"
                                                                }
                                                            >
                                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No applications have been submitted for this campaign yet.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
