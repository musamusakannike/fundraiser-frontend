"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/authContext"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  Heart,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  Settings,
  HelpCircle,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SERVER_URL } from "@/constants"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, token, logout, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-emerald-800">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-1">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/" className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Heart className="h-5 w-5" />
              </div>
              <span className="ml-2 text-xl font-bold text-emerald-800">The Advocate</span>
            </Link>
          </div>

          <div className="hidden md:block md:w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full border-none bg-gray-100 pl-10 focus-visible:ring-1 focus-visible:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-500 hover:bg-gray-100 hover:text-emerald-600"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-medium text-white">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </Button>
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10 border-2 border-emerald-100">
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.fullName} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {user ? getInitials(user.fullName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/help" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="h-full w-72 overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-in-out"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="mb-6 flex items-center border-b pb-4">
                  <Avatar className="h-12 w-12 border-2 border-emerald-100 bg-emerald-100 text-emerald-700 mr-3">
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.fullName} />
                    <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full border-gray-200 bg-gray-100 pl-10 focus-visible:ring-1 focus-visible:ring-emerald-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-emerald-50 text-emerald-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <span
                          className={`mr-3 ${pathname === item.href ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"}`}
                        >
                          {item.icon}
                        </span>
                        {item.name}
                      </div>
                      {item.badge && item.badge > 0 && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700">{item.badge}</Badge>
                      )}
                    </Link>
                  ))}

                  {isAdmin && (
                    <>
                      <div className="mt-6 border-t pt-4">
                        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Admin
                        </div>
                        {adminNavItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                              pathname === item.href
                                ? "bg-emerald-50 text-emerald-700 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <span
                                className={`mr-3 ${pathname === item.href ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"}`}
                              >
                                {item.icon}
                              </span>
                              {item.name}
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                  {isSuperAdmin && (
                    <>
                      <div className="mt-6 border-t pt-4">
                        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Super Admin
                        </div>
                        {superAdminNavItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                              pathname === item.href
                                ? "bg-emerald-50 text-emerald-700 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="flex items-center">
                              <span
                                className={`mr-3 ${pathname === item.href ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"}`}
                              >
                                {item.icon}
                              </span>
                              {item.name}
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </nav>

                <div className="mt-6 border-t pt-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 border-r bg-white shadow-sm max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex h-full flex-col">
            <div className="overflow-y-auto p-4">
              <div className="mb-6 flex items-center border-b pb-4">
                <Avatar className="h-12 w-12 border-2 border-emerald-100 bg-emerald-100 text-emerald-700 mr-3">
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.fullName} />
                  <AvatarFallback>{user ? getInitials(user.fullName) : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`mr-3 ${pathname === item.href ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"}`}
                      >
                        {item.icon}
                      </span>
                      {item.name}
                    </div>
                    {item.badge && item.badge > 0 && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700">{item.badge}</Badge>
                    )}
                  </Link>
                ))}

                {isAdmin && (
                  <>
                    <div className="mt-6 border-t pt-4">
                      <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Admin
                      </div>
                      {adminNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                            pathname === item.href
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center">
                            <span
                              className={`mr-3 ${pathname === item.href ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"}`}
                            >
                              {item.icon}
                            </span>
                            {item.name}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {isSuperAdmin && (
                  <>
                    <div className="mt-6 border-t pt-4">
                      <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Super Admin
                      </div>
                      {superAdminNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                            pathname === item.href
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center">
                            <span
                              className={`mr-3 ${pathname === item.href ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600"}`}
                            >
                              {item.icon}
                            </span>
                            {item.name}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </nav>
            </div>

            <div className="mt-auto border-t p-4">
              <div className="mb-4 rounded-lg bg-emerald-50 p-3">
                <div className="flex items-start">
                  <HelpCircle className="mr-3 h-5 w-5 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-800">Need help?</h4>
                    <p className="mt-1 text-xs text-emerald-600">Contact our support team</p>
                    <Button variant="link" className="mt-1 h-auto p-0 text-xs text-emerald-700">
                      Get Support
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50  sm:p-3 md:p-6">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
