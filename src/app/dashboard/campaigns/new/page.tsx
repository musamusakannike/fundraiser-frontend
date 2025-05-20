"use client"
import { useState, useRef } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Heart,
  ArrowLeft,
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  DollarSign,
  Building,
  CreditCard,
  User,
} from "lucide-react"
import Link from "next/link"
import { SERVER_URL } from "@/constants"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface FormData {
  title: string
  description: string
  amountNeeded: string
  bankAccountNumber: string
  bankAccountName: string
  bankName: string
}

interface FormErrors {
  title?: string
  description?: string
  amountNeeded?: string
  bankAccountNumber?: string
  bankAccountName?: string
  bankName?: string
  images?: string
}

const CreateCampaignPage = () => {
  const { token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    amountNeeded: "",
    bankAccountNumber: "",
    bankAccountName: "",
    bankName: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)

      // Check if adding these files would exceed the limit
      if (images.length + selectedFiles.length > 5) {
        setErrors((prev) => ({ ...prev, images: "Maximum 5 images allowed" }))
        return
      }

      // Clear image error if it exists
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: undefined }))
      }

      // Add new files to the images array
      setImages((prev) => [...prev, ...selectedFiles])

      // Create URLs for preview
      const newImageUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      setImageUrls((prev) => [...prev, ...newImageUrls])
    }
  }

  const removeImage = (index: number) => {
    // Remove image and URL at the specified index
    setImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke the object URL to free memory
    URL.revokeObjectURL(imageUrls[index])
    setImageUrls((prev) => prev.filter((_, i) => i !== index))

    // Clear image error if it exists
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.amountNeeded) {
      newErrors.amountNeeded = "Amount is required"
    } else if (isNaN(Number(formData.amountNeeded)) || Number(formData.amountNeeded) <= 0) {
      newErrors.amountNeeded = "Amount must be a positive number"
    }

    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = "Account number is required"
    }

    if (!formData.bankAccountName.trim()) {
      newErrors.bankAccountName = "Account name is required"
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create form data for multipart/form-data request
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("amountNeeded", formData.amountNeeded)
      formDataToSend.append("bankAccountNumber", formData.bankAccountNumber)
      formDataToSend.append("bankAccountName", formData.bankAccountName)
      formDataToSend.append("bankName", formData.bankName)

      // Append each image
      images.forEach((image) => {
        formDataToSend.append("images", image)
      })

      const response = await fetch(`${SERVER_URL}/api/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: "Campaign created successfully",
        })
        router.push(`/dashboard/campaigns/${data.campaign._id}`)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "")

    // Format with commas
    if (numericValue) {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
        .format(Number(numericValue))
        .replace("NGN", "")
        .trim()
    }
    return ""
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "")
    setFormData((prev) => ({ ...prev, amountNeeded: rawValue }))

    if (errors.amountNeeded) {
      setErrors((prev) => ({ ...prev, amountNeeded: undefined }))
    }
  }

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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Campaign</h1>
            <p className="text-emerald-100">
              Create a new fundraising campaign to help those in need. Fill in the details below to get started.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8">
            {/* Campaign Details Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Campaign Details</CardTitle>
                <CardDescription className="text-emerald-600">
                  Provide the basic information about your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">
                    Campaign Title <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Help Build a Mosque in Lagos"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.title && "border-red-300 focus-visible:ring-red-500",
                      )}
                      value={formData.title}
                      onChange={handleChange}
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
                    Campaign Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide details about your campaign, its purpose, and how the funds will be used..."
                    className={cn(
                      "min-h-[150px] border-gray-200 focus-visible:ring-emerald-500",
                      errors.description && "border-red-300 focus-visible:ring-red-500",
                    )}
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Amount Needed */}
                <div className="space-y-2">
                  <Label htmlFor="amountNeeded" className="text-gray-700">
                    Amount Needed (NGN) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="amountNeeded"
                      name="amountNeeded"
                      placeholder="e.g., 5,000,000"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.amountNeeded && "border-red-300 focus-visible:ring-red-500",
                      )}
                      value={formatCurrency(formData.amountNeeded)}
                      onChange={handleAmountChange}
                    />
                  </div>
                  {errors.amountNeeded && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.amountNeeded}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Details Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Bank Details</CardTitle>
                <CardDescription className="text-emerald-600">
                  Provide the bank account details for donations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Bank Name */}
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-gray-700">
                    Bank Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder="e.g., First Bank"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.bankName && "border-red-300 focus-visible:ring-red-500",
                      )}
                      value={formData.bankName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.bankName && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.bankName}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber" className="text-gray-700">
                    Account Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      placeholder="e.g., 0123456789"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.bankAccountNumber && "border-red-300 focus-visible:ring-red-500",
                      )}
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.bankAccountNumber && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.bankAccountNumber}
                    </p>
                  )}
                </div>

                {/* Account Name */}
                <div className="space-y-2">
                  <Label htmlFor="bankAccountName" className="text-gray-700">
                    Account Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="bankAccountName"
                      name="bankAccountName"
                      placeholder="e.g., Islamic Fundraiser"
                      className={cn(
                        "pl-9 border-gray-200 focus-visible:ring-emerald-500",
                        errors.bankAccountName && "border-red-300 focus-visible:ring-red-500",
                      )}
                      value={formData.bankAccountName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.bankAccountName && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.bankAccountName}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Images Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Campaign Images</CardTitle>
                <CardDescription className="text-emerald-600">
                  Upload up to 5 images for your campaign (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors",
                      errors.images ? "border-red-300" : "border-gray-200",
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="rounded-full bg-emerald-100 p-3">
                        <Upload className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="text-sm font-medium">Click to upload images</div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                        <br />
                        Maximum 5 images
                      </p>
                    </div>
                  </div>

                  {errors.images && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.images}
                    </p>
                  )}

                  {/* Image Previews */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={url || "/placeholder.svg"}
                              alt={`Campaign image ${index + 1}`}
                              className="w-full h-full object-cover"
                              width={200}
                              height={150}
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200 transition-colors"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Images Message */}
                  {imageUrls.length === 0 && (
                    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center text-gray-500 text-sm">
                        <ImageIcon className="h-4 w-4 mr-2 text-gray-400" />
                        No images uploaded yet
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Link href="/dashboard/campaigns">
                    <Button variant="outline" type="button" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Campaign...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Campaign
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

export default CreateCampaignPage
