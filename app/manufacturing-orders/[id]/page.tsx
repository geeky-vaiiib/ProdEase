"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Play, Pause, CheckCircle, Package, Wrench } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"

interface ManufacturingOrder {
  id: string
  reference: string
  finishedProduct: string
  quantity: number
  status: "Draft" | "Confirmed" | "In Progress" | "To Close" | "Done" | "Cancelled"
  scheduledStartDate: string
  dueDate: string
  assignee: string
  progress: number
  bomId: string
  notes?: string
  components: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    allocated: number
    available: number
  }>
  workOrders: Array<{
    id: string
    operation: string
    workCenter: string
    status: "Planned" | "In Progress" | "Done" | "Cancelled"
    estimatedDuration: number
    actualDuration?: number
    assignee: string
  }>
}

// Mock data - in real app this would come from API
const mockOrder: ManufacturingOrder = {
  id: "1",
  reference: "MO-2024-001",
  finishedProduct: "Steel Frame Assembly",
  quantity: 50,
  status: "In Progress",
  scheduledStartDate: "2024-01-10",
  dueDate: "2024-01-15",
  assignee: "John Smith",
  progress: 65,
  bomId: "BOM-001",
  notes: "Priority order for customer ABC Corp. Ensure quality standards are met.",
  components: [
    { id: "1", name: "Steel Tube 50mm", quantity: 200, unit: "pcs", allocated: 200, available: 150 },
    { id: "2", name: "Welding Rod", quantity: 10, unit: "kg", allocated: 10, available: 25 },
    { id: "3", name: "Paint Primer", quantity: 5, unit: "L", allocated: 5, available: 12 },
  ],
  workOrders: [
    {
      id: "WO-001",
      operation: "Cutting",
      workCenter: "CNC-01",
      status: "Done",
      estimatedDuration: 120,
      actualDuration: 115,
      assignee: "Mike Chen",
    },
    {
      id: "WO-002",
      operation: "Welding",
      workCenter: "WLD-01",
      status: "In Progress",
      estimatedDuration: 180,
      assignee: "Sarah Johnson",
    },
    {
      id: "WO-003",
      operation: "Painting",
      workCenter: "PNT-01",
      status: "Planned",
      estimatedDuration: 90,
      assignee: "David Brown",
    },
  ],
}

export default function ManufacturingOrderDetailPage() {
  const [order, setOrder] = useState<ManufacturingOrder | null>(null)
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

    // Mock API call to fetch order details
    const fetchOrder = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setOrder(mockOrder)
      } catch (error) {
        console.error("Failed to fetch order:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [router, params.id])

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      Confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "In Progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "To Close": "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Done: "bg-green-500/10 text-green-500 border-green-500/20",
      Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
      Planned: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const getAvailabilityStatus = (allocated: number, available: number) => {
    if (available >= allocated) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Available</Badge>
    } else {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Shortage</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading manufacturing order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Manufacturing order not found</p>
          <Button asChild className="mt-4">
            <Link href="/manufacturing-orders">Back to Manufacturing Orders</Link>
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
                    <Link href="/manufacturing-orders">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{order.reference}</h1>
                    <p className="text-muted-foreground mt-1">{order.finishedProduct}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  <Button asChild>
                    <Link href={`/manufacturing-orders/${order.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium">{order.quantity} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Assignee</p>
                          <p className="font-medium">{order.assignee}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{new Date(order.scheduledStartDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium">{new Date(order.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="font-medium">{order.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Components */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Components ({order.bomId})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Component</TableHead>
                            <TableHead>Required</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.components.map((component) => (
                            <TableRow key={component.id}>
                              <TableCell className="font-medium">{component.name}</TableCell>
                              <TableCell>
                                {component.quantity} {component.unit}
                              </TableCell>
                              <TableCell>
                                {component.available} {component.unit}
                              </TableCell>
                              <TableCell>{getAvailabilityStatus(component.quantity, component.available)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Work Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Work Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operation</TableHead>
                            <TableHead>Work Center</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.workOrders.map((workOrder) => (
                            <TableRow key={workOrder.id}>
                              <TableCell className="font-medium">{workOrder.operation}</TableCell>
                              <TableCell>{workOrder.workCenter}</TableCell>
                              <TableCell>{workOrder.assignee}</TableCell>
                              <TableCell>
                                {workOrder.actualDuration
                                  ? `${workOrder.actualDuration}min (${workOrder.estimatedDuration}min est.)`
                                  : `${workOrder.estimatedDuration}min est.`}
                              </TableCell>
                              <TableCell>{getStatusBadge(workOrder.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Overall Progress</span>
                            <span>{order.progress}%</span>
                          </div>
                          <Progress value={order.progress} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Work Order Progress</p>
                          {order.workOrders.map((wo) => (
                            <div key={wo.id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{wo.operation}</span>
                              <span className="ml-2">{getStatusBadge(wo.status)}</span>
                            </div>
                          ))}
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
                      {order.status === "Confirmed" && (
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Start Production
                        </Button>
                      )}
                      {order.status === "In Progress" && (
                        <Button className="w-full">
                          <Pause className="h-4 w-4 mr-2" />
                          Mark To Close
                        </Button>
                      )}
                      {order.status === "To Close" && (
                        <Button className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Order
                        </Button>
                      )}
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href={`/work-orders?mo=${order.id}`}>View Work Orders</Link>
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
