"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Upload, X, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { SERVER_URL } from "@/constants"

interface Campaign {
    _id: string
    title: string
    status: string
}

const NewApplicationPage = () => {
    const { user, token } = useAuth()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [additionalDetails, setAdditionalDetails] = useState("")
    const [campaignId, setCampaignId] = useState("")
    const [documents, setDocuments] = useState<File[]>([])
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [fetchingCampaigns, setFetchingCampaigns] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "")
            setEmail(user.email || "")
        }
    }, [user])

    useEffect(() => {
        const campaign = searchParams.get("campaign")
        if (campaign) {
            setCampaignId(campaign)
        }
    }, [searchParams])

    useEffect(() => {
        const fetchCampaigns = async () => {
            setFetchingCampaigns(true)
            try {
                const response = await fetch(`${SERVER_URL}/api/campaigns/active`)
                if (response.ok) {
                    const data = await response.json()
                    setCampaigns(data.campaigns)
                }
            } catch (error) {
                console.error("Error fetching campaigns:", error)
                toast({
                    title: "Error",
                    description: "Failed to load campaigns",
                    variant: "destructive",
                })
            } finally {
                setFetchingCampaigns(false)
            }
        }

        fetchCampaigns()
    }, [toast])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileArray = Array.from(e.target.files)

            // Check if adding new files would exceed the limit
            if (documents.length + fileArray.length > 3) {
                toast({
                    title: "Error",
                    description: "You can upload a maximum of 3 documents",
                    variant: "destructive",
                })
                return
            }

            // Check file sizes
            const oversizedFiles = fileArray.filter((file) => file.size > 10 * 1024 * 1024) // 10MB
            if (oversizedFiles.length > 0) {
                toast({
                    title: "Error",
                    description: "One or more files exceed the 10MB size limit",
                    variant: "destructive",
                })
                return
            }

            setDocuments((prev) => [...prev, ...fileArray])
        }
    }

    const removeFile = (index: number) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            toast({
                title: "Error",
                description: "You must be logged in to submit an application",
                variant: "destructive",
            })
            return
        }

        if (!campaignId) {
            toast({
                title: "Error",
                description: "You must select a campaign",
                variant: "destructive",
            })
            return
        }

        if (!title || !description || !fullName || !email) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        setSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("title", title)
            formData.append("description", description)
            formData.append("fullName", fullName)
            formData.append("email", email)
            formData.append("additionalDetails", additionalDetails)
            formData.append("campaignId", campaignId)
            documents.forEach((file) => {
                formData.append("documents", file)
            })

            const response = await fetch(`${SERVER_URL}/api/applications`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Application submitted successfully!",
                })
                router.push("/dashboard/applications")
            } else {
                const errorData = await response.json()
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to submit application",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error submitting application:", error)
            toast({
                title: "Error",
                description: "Failed to submit application",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
            <Card>
                <CardHeader>
                    <CardTitle>New Application</CardTitle>
                    <CardDescription>Submit a new application for a campaign.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="campaign">Campaign</Label>
                            <Select
                                value={campaignId}
                                onValueChange={setCampaignId}
                                disabled={!fetchingCampaigns && campaigns.length === 0}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a campaign" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fetchingCampaigns ? (
                                        <div className="flex items-center px-3 py-2 text-gray-500 text-sm" aria-disabled="true">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading campaigns...
                                        </div>
                                    ) : campaigns.length > 0 ? (
                                        campaigns.map((campaign) => (
                                            <SelectItem key={campaign._id} value={campaign._id}>
                                                {campaign.title}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="px-3 py-2 text-gray-500 text-sm" aria-disabled="true">
                                            No active campaigns found
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Application Title"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Application Description"
                            />
                        </div>
                        <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your Full Name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your Email"
                            />
                        </div>
                        <div>
                            <Label htmlFor="additionalDetails">Additional Details</Label>
                            <Textarea
                                id="additionalDetails"
                                value={additionalDetails}
                                onChange={(e) => setAdditionalDetails(e.target.value)}
                                placeholder="Any additional details you want to share"
                            />
                        </div>
                        <div>
                            <Label htmlFor="documents">Documents (Max 3, Max 10MB each)</Label>
                            <Input
                                type="file"
                                id="documents"
                                multiple
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="hidden"
                            />
                            <Button asChild variant="secondary">
                                <Label htmlFor="documents" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Documents
                                </Label>
                            </Button>
                            {documents.length > 0 && (
                                <div className="mt-2">
                                    {documents.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-md border p-2">
                                            <div className="flex items-center space-x-2">
                                                <FileText className="h-4 w-4" />
                                                <span>{file.name}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Application
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </DashboardLayout>
    )
}

export default NewApplicationPage
