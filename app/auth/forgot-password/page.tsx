"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Image from "next/image"

type Step = "email" | "otp" | "success"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      // Mock API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("otp")
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    try {
      // Mock API call to verify OTP and reset password
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("success")
    } catch (err) {
      setError("Invalid OTP or failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  )

  const renderOtpStep = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="otp">OTP Code</Label>
        <Input
          id="otp"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={formData.otp}
          onChange={(e) => setFormData((prev) => ({ ...prev, otp: e.target.value }))}
          maxLength={6}
          required
        />
        <p className="text-sm text-muted-foreground">OTP sent to {formData.email}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </Button>

      <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Email
      </Button>
    </form>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="bg-green-100 bg-green-500/10 rounded-full p-3 w-16 h-16 mx-auto flex items-center justify-center">
        <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center">
          <span className="text-white text-lg">✓</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Password Reset Successful</h3>
        <p className="text-muted-foreground">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
      </div>
      <Button onClick={() => router.push("/auth/login")} className="w-full">
        Continue to Sign In
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/prodease-logo.svg"
              alt="ProdEase Logo"
              width={120}
              height={40}
              className="text-primary"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "success" && "All Set!"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to receive an OTP"}
            {step === "otp" && "Enter the OTP and set your new password"}
            {step === "success" && "Your password has been reset"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && renderEmailStep()}
          {step === "otp" && renderOtpStep()}
          {step === "success" && renderSuccessStep()}

          {step === "email" && (
            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary">
                Back to Sign In
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
