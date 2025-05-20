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
import { useToast } from "@/components/ui/use-toast"
import { FileText, X, Loader2, ArrowLeft, CheckCircle, AlertCircle, User, Mail, FileUp, Info } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { SERVER_URL } from "@/constants"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const NewApplicationPage = () => {
  const { user, token } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [documents, setDocuments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get campaign ID from URL if present
  const campaignId = searchParams.get("campaign")

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "")
      setEmail(user.email || "")
    }
  }, [user])

  // Fetch campaign details if campaignId is present
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!campaignId) return

      try {
        const response = await fetch(`${SERVER_URL}/api/campaigns/${campaignId}`)
        if (response.ok) {
          const data = await response.json()
          setTitle(`Application for: ${data.campaign.title}`)
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error)
      }
    }

    fetchCampaignDetails()
  }, [campaignId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)

      // Check if adding new files would exceed the limit
      if (documents.length + fileArray.length > 3) {
        setErrors((prev) => ({
          ...prev,
          documents: "You can upload a maximum of 3 documents",
        }))
        return
      }

      // Check file sizes
      const oversizedFiles = fileArray.filter((file) => file.size > 10 * 1024 * 1024) // 10MB
      if (oversizedFiles.length > 0) {
        setErrors((prev) => ({
          ...prev,
          documents: "One or more files exceed the 10MB size limit",
        }))
        return
      }

      // Clear error if it exists
      if (errors.documents) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.documents
          return newErrors
        })
      }

      setDocuments((prev) => [...prev, ...fileArray])
    }
  }

  const removeFile = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fix the errors in the form",
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

      if (campaignId) {
        formData.append("campaign", campaignId)
      }

      documents.forEach((file) => {
        formData.append("proofDocuments", file)
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
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
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
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">New Application</h1>
            <p className="text-emerald-100">
              Submit a new application for support. Please provide detailed information to help us evaluate your
              request.
            </p>
          </div>
        </div>

        {campaignId && (
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
            <Info className="h-4 w-4 text-emerald-600" />
            <AlertTitle>Campaign Application</AlertTitle>
            <AlertDescription>
              You are applying for a specific campaign. Your application will be reviewed by the campaign
              administrators.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8">
            {/* Application Details Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Application Details</CardTitle>
                <CardDescription className="text-emerald-600">
                  Provide information about your application
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        if (errors.title) {
                          setErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors.title
                            return newErrors
                          })
                        }
                      }}
                      placeholder="Application Title"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.title && "border-red-300 focus-visible:ring-red-500",
                      )}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      if (errors.description) {
                        setErrors((prev) => {
                          const newErrors = { ...prev }
                          delete newErrors.description
                          return newErrors
                        })
                      }
                    }}
                    placeholder="Explain why you're applying and how the funds will be used..."
                    className={cn(
                      "min-h-[150px] border-gray-200 focus-visible:ring-emerald-500",
                      errors.description && "border-red-300 focus-visible:ring-red-500",
                    )}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Additional Details */}
                <div className="space-y-2">
                  <Label htmlFor="additionalDetails" className="text-gray-700">
                    Additional Details <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Textarea
                    id="additionalDetails"
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="Any additional information that might support your application..."
                    className="min-h-[100px] border-gray-200 focus-visible:ring-emerald-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Contact Information</CardTitle>
                <CardDescription className="text-emerald-600">Your contact details for communication</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (errors.fullName) {
                          setErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors.fullName
                            return newErrors
                          })
                        }
                      }}
                      placeholder="Your Full Name"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.fullName && "border-red-300 focus-visible:ring-red-500",
                      )}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) {
                          setErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors.email
                            return newErrors
                          })
                        }
                      }}
                      placeholder="Your Email Address"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.email && "border-red-300 focus-visible:ring-red-500",
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supporting Documents Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Supporting Documents</CardTitle>
                <CardDescription className="text-emerald-600">
                  Upload documents to support your application (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documents" className="text-gray-700">
                    Documents <span className="text-gray-400">(Max 3, Max 10MB each)</span>
                  </Label>

                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors",
                      errors.documents ? "border-red-300" : "border-gray-200",
                    )}
                    onClick={() => document.getElementById("documents")?.click()}
                  >
                    <Input
                      type="file"
                      id="documents"
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="rounded-full bg-emerald-100 p-3">
                        <FileUp className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="text-sm font-medium">Click to upload documents</div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB
                        <br />
                        Maximum 3 documents
                      </p>
                    </div>
                  </div>

                  {errors.documents && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.documents}
                    </p>
                  )}

                  {/* Document List */}
                  {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {documents.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border border-gray-200 p-3 bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            <div>
                              <p className="font-medium text-sm truncate max-w-[200px] md:max-w-[300px]">{file.name}</p>
                              <p className="text-xs text-gray-500">{getFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove file</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Link href="/dashboard/applications">
                    <Button variant="outline" type="button" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default NewApplicationPage
