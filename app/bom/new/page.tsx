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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Plus, Trash2, Package, Wrench } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"

interface Product {
  id: string
  name: string
  category: string
}

interface Material {
  id: string
  name: string
  unit: string
  unitCost: number
  supplier?: string
  stockLevel: number
}

interface Component {
  id: string
  materialId: string
  name: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  supplier?: string
}

interface Operation {
  id: string
  sequence: number
  operation: string
  workCenter: string
  setupTime: number
  runTime: number
}

const mockProducts: Product[] = [
  { id: "1", name: "Steel Frame Assembly", category: "Structural" },
  { id: "2", name: "Aluminum Housing", category: "Enclosure" },
  { id: "3", name: "Circuit Board PCB", category: "Electronics" },
  { id: "4", name: "Motor Assembly", category: "Mechanical" },
  { id: "5", name: "Sensor Module", category: "Electronics" },
]

const mockMaterials: Material[] = [
  { id: "1", name: "Steel Tube 50mm", unit: "pcs", unitCost: 25.0, supplier: "Steel Corp", stockLevel: 150 },
  { id: "2", name: "Welding Rod", unit: "kg", unitCost: 15.0, supplier: "Weld Supply", stockLevel: 25 },
  { id: "3", name: "Paint Primer", unit: "L", unitCost: 22.5, supplier: "Paint Co", stockLevel: 12 },
  { id: "4", name: "Aluminum Sheet 2mm", unit: "pcs", unitCost: 80.0, supplier: "Aluminum Inc", stockLevel: 30 },
  { id: "5", name: "Rivets", unit: "pcs", unitCost: 1.15, supplier: "Fastener Co", stockLevel: 500 },
  { id: "6", name: "PCB Substrate", unit: "pcs", unitCost: 15.0, supplier: "PCB Fab", stockLevel: 200 },
  { id: "7", name: "Solder Paste", unit: "kg", unitCost: 350.0, supplier: "Electronics Supply", stockLevel: 5 },
]

const mockWorkCenters = ["CNC-01", "WLD-01", "PNT-01", "STP-01", "ASM-01", "SMT-01", "QC-01"]

export default function NewBOMPage() {
  const [formData, setFormData] = useState({
    finishedProduct: "",
    version: "1.0",
    description: "",
  })
  const [components, setComponents] = useState<Component[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
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

  const addComponent = () => {
    const newComponent: Component = {
      id: Date.now().toString(),
      materialId: "",
      name: "",
      quantity: 1,
      unit: "pcs",
      unitCost: 0,
      totalCost: 0,
      supplier: "",
    }
    setComponents([...components, newComponent])
  }

  const updateComponent = (id: string, field: keyof Component, value: any) => {
    setComponents((prev) =>
      prev.map((comp) => {
        if (comp.id === id) {
          const updated = { ...comp, [field]: value }

          // If material is selected, populate details
          if (field === "materialId" && value) {
            const material = mockMaterials.find((m) => m.id === value)
            if (material) {
              updated.name = material.name
              updated.unit = material.unit
              updated.unitCost = material.unitCost
              updated.supplier = material.supplier
              updated.totalCost = updated.quantity * material.unitCost
            }
          }

          // Recalculate total cost when quantity changes
          if (field === "quantity") {
            updated.totalCost = value * updated.unitCost
          }

          return updated
        }
        return comp
      }),
    )
  }

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== id))
  }

  const addOperation = () => {
    const newOperation: Operation = {
      id: Date.now().toString(),
      sequence: (operations.length + 1) * 10,
      operation: "",
      workCenter: "",
      setupTime: 0,
      runTime: 0,
    }
    setOperations([...operations, newOperation])
  }

  const updateOperation = (id: string, field: keyof Operation, value: any) => {
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, [field]: value } : op)))
  }

  const removeOperation = (id: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.finishedProduct || !formData.version) {
      setError("Please fill in all required fields")
      return
    }

    if (components.length === 0) {
      setError("Please add at least one component")
      return
    }

    // Validate components
    for (const comp of components) {
      if (!comp.materialId || comp.quantity <= 0) {
        setError("Please complete all component details")
        return
      }
    }

    setIsLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate reference number
      const reference = `BOM-${String(Date.now()).slice(-3)}`

      // Mock successful creation
      router.push("/bom?created=" + reference)
    } catch (err) {
      setError("Failed to create BOM. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalEstimatedCost = components.reduce((sum, comp) => sum + comp.totalCost, 0)

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
                  <Link href="/bom">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to BOMs
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">New Bill of Materials</h1>
                  <p className="text-muted-foreground mt-1">Create a new product structure</p>
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
                              <SelectItem key={product.id} value={product.name}>
                                {product.name} ({product.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="version">Version *</Label>
                        <Input
                          id="version"
                          type="text"
                          placeholder="e.g., 1.0"
                          value={formData.version}
                          onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="BOM description or notes..."
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Components */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Components ({components.length})
                      </CardTitle>
                      <Button type="button" onClick={addComponent} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Component
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {components.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Unit Cost</TableHead>
                            <TableHead>Total Cost</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {components.map((component) => (
                            <TableRow key={component.id}>
                              <TableCell>
                                <Select
                                  value={component.materialId}
                                  onValueChange={(value) => updateComponent(component.id, "materialId", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockMaterials.map((material) => (
                                      <SelectItem key={material.id} value={material.id}>
                                        {material.name} (Stock: {material.stockLevel})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={component.quantity}
                                  onChange={(e) =>
                                    updateComponent(component.id, "quantity", Number.parseFloat(e.target.value) || 0)
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>{component.unit}</TableCell>
                              <TableCell>${component.unitCost.toFixed(2)}</TableCell>
                              <TableCell>${component.totalCost.toFixed(2)}</TableCell>
                              <TableCell>{component.supplier}</TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeComponent(component.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No components added yet. Click "Add Component" to get started.
                      </div>
                    )}

                    {components.length > 0 && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Estimated Cost:</span>
                          <span className="text-lg font-bold">${totalEstimatedCost.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Operations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Operations ({operations.length})
                      </CardTitle>
                      <Button type="button" onClick={addOperation} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Operation
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {operations.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sequence</TableHead>
                            <TableHead>Operation</TableHead>
                            <TableHead>Work Center</TableHead>
                            <TableHead>Setup Time (min)</TableHead>
                            <TableHead>Run Time (min)</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {operations.map((operation) => (
                            <TableRow key={operation.id}>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  step="10"
                                  value={operation.sequence}
                                  onChange={(e) =>
                                    updateOperation(operation.id, "sequence", Number.parseInt(e.target.value) || 0)
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="text"
                                  placeholder="Operation name"
                                  value={operation.operation}
                                  onChange={(e) => updateOperation(operation.id, "operation", e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={operation.workCenter}
                                  onValueChange={(value) => updateOperation(operation.id, "workCenter", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select work center" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockWorkCenters.map((center) => (
                                      <SelectItem key={center} value={center}>
                                        {center}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={operation.setupTime}
                                  onChange={(e) =>
                                    updateOperation(operation.id, "setupTime", Number.parseInt(e.target.value) || 0)
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={operation.runTime}
                                  onChange={(e) =>
                                    updateOperation(operation.id, "runTime", Number.parseInt(e.target.value) || 0)
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOperation(operation.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No operations defined yet. Click "Add Operation" to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/bom">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create BOM
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
