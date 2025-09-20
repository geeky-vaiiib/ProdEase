"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Mail, Shield, Save } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    loginId: "",
    email: "",
    role: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        loginId: user.loginId,
        email: user.email || "",
        role: user.role,
      })
    }
  }, [user])

  const handleSave = () => {
    // Mock save functionality
    console.log("Profile updated:", formData)
  }

  const getInitials = (loginId: string) => {
    return loginId.slice(0, 2).toUpperCase()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <ProfileSidebar />
          
          <div className="flex-1 flex flex-col lg:ml-64">
            <div className="flex-1 lg:mr-64">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your account settings</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {user ? getInitials(user.loginId) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{user?.loginId}</h3>
                          <p className="text-muted-foreground">{user?.role}</p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="loginId">Login ID</Label>
                          <Input
                            id="loginId"
                            value={formData.loginId}
                            onChange={(e) => setFormData(prev => ({ ...prev, loginId: e.target.value }))}
                            disabled
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter your email"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            value={formData.role}
                            disabled
                          />
                        </div>
                      </div>

                      <Button onClick={handleSave} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <MasterSidebar />
        </div>
      </div>
    </ProtectedRoute>
  )
}
