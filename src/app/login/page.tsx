"use client"

import React, { useState } from "react"
import { useAuth } from "@/contexts/authContext"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

const LoginPage = () => {
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
    setSuccess(true)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-600 text-white mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-emerald-800">The Advocate</h1>
          <p className="text-emerald-600 mt-1">Islamic Fundraiser Platform</p>
        </div>

        <Card className="border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-emerald-100">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-8 px-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && !error && (
              <Alert className="mb-6 bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                <AlertDescription>Login successful! Redirecting...</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 border-gray-200 focus-visible:ring-emerald-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-800">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 border-gray-200 focus-visible:ring-emerald-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-emerald-600 font-medium hover:text-emerald-800">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} The Advocate. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
