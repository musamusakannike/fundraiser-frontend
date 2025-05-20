"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Key,
  Lock,
  LogOut,
  Edit,
} from "lucide-react"
import { SERVER_URL } from "@/constants"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfileData {
  fullName: string
  email: string
  phoneNumber: string
  role: string
  createdAt: string
  avatar?: string
}

const ProfilePage = () => {
  const { token, logout } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return

      setLoading(true)
      try {
        const response = await fetch(`${SERVER_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setProfileData(data.user)
          setFormData({
            fullName: data.user.fullName,
            phoneNumber: data.user.phoneNumber,
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateProfileForm()) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`${SERVER_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfileData(data.user)
        setEditMode(false)
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch(`${SERVER_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        toast({
          title: "Success",
          description: "Password changed successfully",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to change password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
            <p className="mt-4 text-emerald-800">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-amber-100 p-4 mb-4">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            We couldn&apos;t load your profile information. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </DashboardLayout>
    )
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
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-white/30 bg-emerald-100 text-emerald-800">
                <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.fullName} />
                <AvatarFallback className="text-2xl">{getInitials(profileData.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{profileData.fullName}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-emerald-100">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    <span>{profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Member since {formatDate(profileData.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Profile Information
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-emerald-800">Profile Information</CardTitle>
                    <CardDescription className="text-emerald-600">Manage your personal information</CardDescription>
                  </div>
                  {!editMode && (
                    <Button
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          name="fullName"
                          className="pl-10 border-gray-200 focus-visible:ring-emerald-500"
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          className="pl-10 border-gray-200 bg-gray-50"
                          value={profileData.email}
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-gray-700">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          className="pl-10 border-gray-200 focus-visible:ring-emerald-500"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto" disabled={updating}>
                        {updating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Full Name</Label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="font-medium">{profileData.fullName}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Email</Label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Mail className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="font-medium">{profileData.email}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Phone Number</Label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="font-medium">{profileData.phoneNumber || "Not provided"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-500 text-sm">Role</Label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Shield className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="font-medium">
                            {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-gray-500 text-sm">Member Since</Label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{formatDate(profileData.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-lg font-semibold text-emerald-800">Change Password</CardTitle>
                <CardDescription className="text-emerald-600">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-700">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        className="pl-10 border-gray-200 focus-visible:ring-emerald-500"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className="pl-10 border-gray-200 focus-visible:ring-emerald-500"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="pl-10 border-gray-200 focus-visible:ring-emerald-500"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                      Make sure your password is at least 8 characters and includes a mix of letters, numbers, and
                      symbols for better security.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full sm:w-auto" disabled={changingPassword}>
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b">
                <CardTitle className="text-lg font-semibold text-red-800">Account Actions</CardTitle>
                <CardDescription className="text-red-600">Manage your account access</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
