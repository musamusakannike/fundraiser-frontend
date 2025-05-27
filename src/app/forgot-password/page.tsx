"use client";

import React, { useState } from "react";
import { Heart, AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";

const ForgotPasswordPage = () => {
  const { forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = React.useState("");
  const [success, setSuccess] = useState(false);
  // const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSuccess(true);
      // router.push("/reset-password");
    } catch (error) {
      console.error(error);
    }
  };
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
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white pt-3 pb-2">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-emerald-100">
              Forgot your password? No problem! Enter your email address below
              and we&apos;ll send you a password reset link.
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
                <AlertDescription>
                  Password reset email sent successfully! Redirecting...
                </AlertDescription>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
