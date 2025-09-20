"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Package, Wrench, DollarSign, Clock, User, Calendar } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"

interface BOM {
  id: string
  reference: string
  finishedProduct: string
  version: string
  status: "Draft" | "Active" | "Obsolete"
  createdBy: string
  createdDate: string
  lastModified: string
  description?: string
  totalComponents: number
  estimatedCost: number
  components: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    unitCost: number
    totalCost: number
    supplier?: string
    stockLevel: number
  }>
  operations: Array<{
    id: string
    sequence: number
    operation: string
    workCenter: string
    setupTime: number
    runTime: number
  }>
}

// Mock data
const mockBOM: BOM = {
  id: "1",
  reference: "BOM-001",
  finishedProduct: "Steel Frame Assembly",
  version: "1.2",
  status: "Active",
  createdBy: "John Smith",
  createdDate: "2024-01-01",
  lastModified: "2024-01-05",
  description:
    "Standard steel frame assembly for industrial applications. Includes all necessary components and operations for complete manufacturing.",
  totalComponents: 3,
  estimatedCost: 125.5,
  components: [
    {
      id: "1",
      name: "Steel Tube 50mm",
      quantity: 4,
      unit: "pcs",
      unitCost: 25.0,
      totalCost: 100.0,
      supplier: "Steel Corp",
      stockLevel: 150,
    },
    {
      id: "2",
      name: "Welding Rod",
      quantity: 0.2,
      unit: "kg",
      unitCost: 15.0,
      totalCost: 3.0,
      supplier: "Weld Supply",
      stockLevel: 25,
    },
    {
      id: "3",
      name: "Paint Primer",
      quantity: 0.1,
      unit: "L",
      unitCost: 22.5,
      totalCost: 2.25,
      supplier: "Paint Co",
      stockLevel: 12,
    },
  ],
  operations: [
    { id: "1", sequence: 10, operation: "Cutting", workCenter: "CNC-01", setupTime: 15, runTime: 30 },
    { id: "2", sequence: 20, operation: "Welding", workCenter: "WLD-01", setupTime: 10, runTime: 45 },
    { id: "3", sequence: 30, operation: "Painting", workCenter: "PNT-01", setupTime: 5, runTime: 20 },
  ],
}

export default function BOMDetailPage() {
  const [bom, setBOM] = useState<BOM | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem("flowforge_user")
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Mock API call to fetch BOM details
    const fetchBOM = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setBOM(mockBOM)
      } catch (error) {
        console.error("Failed to fetch BOM:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBOM()
  }, [router, params.id])

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      Active: "bg-green-500/10 text-green-500 border-green-500/20",
      Obsolete: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const getStockStatus = (stockLevel: number, required: number) => {
    if (stockLevel >= required) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Available</Badge>
    } else if (stockLevel > 0) {
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Low Stock</Badge>
    } else {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Out of Stock</Badge>
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const totalOperationTime = bom?.operations.reduce((sum, op) => sum + op.setupTime + op.runTime, 0) || 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading BOM...</p>
        </div>
      </div>
    )
  }

  if (!bom) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">BOM not found</p>
          <Button asChild className="mt-4">
            <Link href="/bom">Back to BOMs</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ProfileSidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
          <div className="flex-1 lg:mr-64">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/bom">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{bom.reference}</h1>
                    <p className="text-muted-foreground mt-1">
                      {bom.finishedProduct} - Version {bom.version}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(bom.status)}
                  <Button asChild>
                    <Link href={`/bom/${bom.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* BOM Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>BOM Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Created By</p>
                            <p className="font-medium">{bom.createdBy}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Created Date</p>
                            <p className="font-medium">{new Date(bom.createdDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Last Modified</p>
                            <p className="font-medium">{new Date(bom.lastModified).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Components</p>
                            <p className="font-medium">{bom.totalComponents}</p>
                          </div>
                        </div>
                      </div>

                      {bom.description && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="font-medium">{bom.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Components */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Components ({bom.components.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Component</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit Cost</TableHead>
                            <TableHead>Total Cost</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Stock Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bom.components.map((component) => (
                            <TableRow key={component.id}>
                              <TableCell className="font-medium">{component.name}</TableCell>
                              <TableCell>
                                {component.quantity} {component.unit}
                              </TableCell>
                              <TableCell>${component.unitCost.toFixed(2)}</TableCell>
                              <TableCell>${component.totalCost.toFixed(2)}</TableCell>
                              <TableCell>{component.supplier}</TableCell>
                              <TableCell>
                                {getStockStatus(component.stockLevel, component.quantity)}
                                <div className="text-xs text-muted-foreground mt-1">Stock: {component.stockLevel}</div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Operations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Operations ({bom.operations.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sequence</TableHead>
                            <TableHead>Operation</TableHead>
                            <TableHead>Work Center</TableHead>
                            <TableHead>Setup Time</TableHead>
                            <TableHead>Run Time</TableHead>
                            <TableHead>Total Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bom.operations.map((operation) => (
                            <TableRow key={operation.id}>
                              <TableCell className="font-medium">{operation.sequence}</TableCell>
                              <TableCell>{operation.operation}</TableCell>
                              <TableCell>{operation.workCenter}</TableCell>
                              <TableCell>{formatDuration(operation.setupTime)}</TableCell>
                              <TableCell>{formatDuration(operation.runTime)}</TableCell>
                              <TableCell className="font-medium">
                                {formatDuration(operation.setupTime + operation.runTime)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Cost Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Cost Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Material Cost:</span>
                          <span className="font-medium">${bom.estimatedCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Labor Cost:</span>
                          <span className="font-medium">$45.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Overhead:</span>
                          <span className="font-medium">$15.75</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Total Cost:</span>
                            <span className="text-lg font-bold">${(bom.estimatedCost + 45.0 + 15.75).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Time Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Setup Time:</span>
                          <span className="font-medium">
                            {formatDuration(bom.operations.reduce((sum, op) => sum + op.setupTime, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Run Time:</span>
                          <span className="font-medium">
                            {formatDuration(bom.operations.reduce((sum, op) => sum + op.runTime, 0))}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Total Time:</span>
                            <span className="text-lg font-bold">{formatDuration(totalOperationTime)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href={`/manufacturing-orders/new?product=${bom.finishedProduct}`}>
                          Create Manufacturing Order
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href="/stock-ledger">Check Stock Levels</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MasterSidebar />
      </div>
    </div>
  )
}
