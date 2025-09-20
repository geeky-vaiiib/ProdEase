"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"

interface Product {
  id: string
  name: string
  bomId?: string
}

interface Operator {
  id: string
  name: string
  role: string
}

interface Component {
  id: string
  name: string
  requiredQuantity: number
  unit: string
}

const mockProducts: Product[] = [
  { id: "1", name: "Steel Frame Assembly", bomId: "BOM-001" },
  { id: "2", name: "Aluminum Housing", bomId: "BOM-002" },
  { id: "3", name: "Circuit Board PCB", bomId: "BOM-003" },
  { id: "4", name: "Motor Assembly", bomId: "BOM-004" },
  { id: "5", name: "Sensor Module", bomId: "BOM-005" },
]

const mockOperators: Operator[] = [
  { id: "1", name: "John Smith", role: "Senior Operator" },
  { id: "2", name: "Sarah Johnson", role: "Manufacturing Supervisor" },
  { id: "3", name: "Mike Chen", role: "Quality Inspector" },
  { id: "4", name: "Lisa Wang", role: "Production Lead" },
  { id: "5", name: "David Brown", role: "Machine Operator" },
]

const mockBOMComponents: Record<string, Component[]> = {
  "BOM-001": [
    { id: "1", name: "Steel Tube 50mm", requiredQuantity: 4, unit: "pcs" },
    { id: "2", name: "Welding Rod", requiredQuantity: 0.2, unit: "kg" },
    { id: "3", name: "Paint Primer", requiredQuantity: 0.1, unit: "L" },
  ],
  "BOM-002": [
    { id: "4", name: "Aluminum Sheet 2mm", requiredQuantity: 0.5, unit: "pcs" },
    { id: "5", name: "Rivets", requiredQuantity: 5, unit: "pcs" },
  ],
  "BOM-003": [
    { id: "6", name: "PCB Substrate", requiredQuantity: 1, unit: "pcs" },
    { id: "7", name: "Solder Paste", requiredQuantity: 0.01, unit: "kg" },
  ],
}

export default function NewManufacturingOrderPage() {
  const [formData, setFormData] = useState({
    finishedProduct: "",
    quantity: "",
    scheduledStartDate: "",
    assignee: "",
    notes: "",
  })
  const [components, setComponents] = useState<Component[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem("flowforge_user")
    if (!user) {
      router.push("/auth/login")
    }
  }, [router])

  // Update components when product or quantity changes
  useEffect(() => {
    const selectedProduct = mockProducts.find((p) => p.id === formData.finishedProduct)
    if (selectedProduct?.bomId && formData.quantity) {
      const bomComponents = mockBOMComponents[selectedProduct.bomId] || []
      const quantity = Number.parseInt(formData.quantity)

      const updatedComponents = bomComponents.map((component) => ({
        ...component,
        requiredQuantity: component.requiredQuantity * quantity,
      }))

      setComponents(updatedComponents)
    } else {
      setComponents([])
    }
  }, [formData.finishedProduct, formData.quantity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.finishedProduct || !formData.quantity || !formData.scheduledStartDate || !formData.assignee) {
      setError("Please fill in all required fields")
      return
    }

    if (Number.parseInt(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0")
      return
    }

    setIsLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate reference number
      const reference = `MO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`

      // Mock successful creation
      router.push("/manufacturing-orders?created=" + reference)
    } catch (err) {
      setError("Failed to create manufacturing order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProduct = mockProducts.find((p) => p.id === formData.finishedProduct)

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ProfileSidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
          <div className="flex-1 lg:mr-64">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/manufacturing-orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Manufacturing Orders
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">New Manufacturing Order</h1>
                  <p className="text-muted-foreground mt-1">Create a new production order</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="finishedProduct">Finished Product *</Label>
                        <Select
                          value={formData.finishedProduct}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, finishedProduct: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select finished product" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          placeholder="Enter quantity"
                          value={formData.quantity}
                          onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scheduledStartDate">Scheduled Start Date *</Label>
                        <Input
                          id="scheduledStartDate"
                          type="date"
                          value={formData.scheduledStartDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, scheduledStartDate: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee *</Label>
                        <Select
                          value={formData.assignee}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, assignee: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockOperators.map((operator) => (
                              <SelectItem key={operator.id} value={operator.name}>
                                {operator.name} - {operator.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes or instructions..."
                        value={formData.notes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bill of Materials */}
                {selectedProduct?.bomId && components.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Bill of Materials - {selectedProduct.bomId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {components.map((component) => (
                          <div key={component.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{component.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Required: {component.requiredQuantity} {component.unit}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/manufacturing-orders">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Manufacturing Order
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <MasterSidebar />
      </div>
    </div>
  )
}
