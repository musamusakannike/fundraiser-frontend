"use client"

import React, { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SERVER_URL } from "@/constants"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, Pencil, User, Shield, ShieldCheck } from "lucide-react"

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  phoneNumber: string
  profileImage: string
  createdAt: string
  isActive: boolean
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          fullName: "New Admin",
          email: "admin@example.com",
          password: "admin123",
          role: "admin",
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Admin user created successfully",
        })
        fetchUsers()
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create admin user",
      })
    }
  }



  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Role updated to ${newRole}`,
        })
        fetchUsers()
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch(`${SERVER_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        fetchUsers()
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user",
      })
    }
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">User Management</CardTitle>
            <Button
              onClick={handleCreateAdmin}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="search">Search Users</Label>
            <Input
              id="search"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-2"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.role === "admin" && <Shield className="h-4 w-4 text-blue-500" />}
                        {user.role === "superadmin" && <ShieldCheck className="h-4 w-4 text-green-500" />}
                        {user.role}
                      </div>
                    </TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateRole(user._id, user.role === "admin" ? "user" : "admin")}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          {user.role === "admin" ? "Demote" : "Promote"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default ManageUsers;