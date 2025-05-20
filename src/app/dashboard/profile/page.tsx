"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { SERVER_URL } from "@/constants"

const ProfilePage = () => {
    const { user, token } = useAuth()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "")
            setEmail(user.email || "")
            setPhoneNumber(user.phoneNumber || "")
        }
    }, [user])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) return

        setLoading(true)
        try {
            const response = await fetch(`${SERVER_URL}/api/auth/update-profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fullName,
                    phoneNumber,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                })

                // Update local storage with the updated user data
                localStorage.setItem("user", JSON.stringify(data.user))

                // Reload the page to reflect changes in the auth context
                window.location.reload()
            } else {
                const data = await response.json()
                toast({
                    title: "Error",
                    description: data.message || "Failed to update profile",
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
            setLoading(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) return

        // Validate passwords
        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            })
            return
        }

        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            })
            return
        }

        setPasswordLoading(true)
        try {
            const response = await fetch(`${SERVER_URL}/api/auth/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Password changed successfully",
                })

                // Clear password fields
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                const data = await response.json()
                toast({
                    title: "Error",
                    description: data.message || "Failed to change password",
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
            setPasswordLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                    <p className="text-gray-500">Manage your account information and password</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Information */}
                    <Card>
                        <form onSubmit={handleUpdateProfile}>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} disabled className="bg-gray-50" />
                                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+2341234567890"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Change Password */}
                    <Card>
                        <form onSubmit={handleChangePassword}>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your password</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={passwordLoading}>
                                    {passwordLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Changing Password...
                                        </>
                                    ) : (
                                        "Change Password"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Details about your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Account Type</p>
                                <p className="mt-1">
                                    {user?.role
                                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Account Status</p>
                                <p className="mt-1">Active</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Member Since</p>
                                <p className="mt-1">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "N/A"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default ProfilePage
