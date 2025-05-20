"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, Heart, FileText, Bell, LogOut, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SERVER_URL } from "@/constants"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [token, router])

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!token) return

      try {
        const response = await fetch(`${SERVER_URL}/api/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUnreadNotifications(data.count)
        }
      } catch (error) {
        console.error("Error fetching unread notifications:", error)
      }
    }

    fetchUnreadNotifications()
  }, [token])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const isAdmin = user?.role === "admin" || user?.role === "superadmin"
  const isSuperAdmin = user?.role === "superadmin"

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: <Heart className="h-5 w-5" /> },
    { name: "My Applications", href: "/dashboard/applications", icon: <FileText className="h-5 w-5" /> },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="h-5 w-5" />,
      badge: unreadNotifications,
    },
    { name: "Profile", href: "/dashboard/profile", icon: <User className="h-5 w-5" /> },
  ]

  const adminNavItems = [
    { name: "Manage Users", href: "/dashboard/admin/users", icon: <Users className="h-5 w-5" /> },
    { name: "Manage Applications", href: "/dashboard/admin/applications", icon: <FileText className="h-5 w-5" /> },
  ]

  const superAdminNavItems = [
    { name: "Manage Admins", href: "/dashboard/admin/admins", icon: <Users className="h-5 w-5" /> },
  ]

  if (!user) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button className="md:hidden mr-4" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
            </button>
            <Link href="/" className="text-xl font-bold text-emerald-700">
              Islamic Fundraiser
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-emerald-600">
                    {unreadNotifications}
                  </Badge>
                )}
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 bg-emerald-100 text-emerald-700">
                <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">{user.fullName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bg-white w-64 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <div className="mb-6 flex items-center">
                  <Avatar className="h-10 w-10 bg-emerald-100 text-emerald-700 mr-3">
                    <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${pathname === item.href
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                      {item.badge && item.badge > 0 && <Badge className="ml-auto bg-emerald-600">{item.badge}</Badge>}
                    </Link>
                  ))}

                  {isAdmin && (
                    <>
                      <div className="pt-4 pb-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</div>
                      </div>
                      {adminNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${pathname === item.href
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      ))}
                    </>
                  )}

                  {isSuperAdmin && (
                    <>
                      <div className="pt-4 pb-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Super Admin</div>
                      </div>
                      {superAdminNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${pathname === item.href
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>

                <div className="pt-6 mt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r bg-white">
          <div className="h-full flex flex-col">
            <div className="p-4">
              <div className="mb-6 flex items-center">
                <Avatar className="h-10 w-10 bg-emerald-100 text-emerald-700 mr-3">
                  <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${pathname === item.href
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {item.icon}
                    {item.name}
                    {item.badge && item.badge > 0 && <Badge className="ml-auto bg-emerald-600">{item.badge}</Badge>}
                  </Link>
                ))}

                {isAdmin && (
                  <>
                    <div className="pt-4 pb-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</div>
                    </div>
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${pathname === item.href
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}

                {isSuperAdmin && (
                  <>
                    <div className="pt-4 pb-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Super Admin</div>
                    </div>
                    {superAdminNavItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${pathname === item.href
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </>
                )}
              </nav>
            </div>

            <div className="mt-auto p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
