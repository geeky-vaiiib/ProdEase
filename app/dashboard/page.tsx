"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, TrendingUp, Clock, AlertTriangle, CheckCircle, MoreHorizontal } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { AppHeader } from "@/components/app-header"
import { ProtectedRoute } from "@/components/protected-route"
import { DataSyncStatus } from "@/components/real-time-indicator"

interface ManufacturingOrder {
  id: string
  reference: string
  finishedProduct: string
  quantity: number
  status: "Planned" | "In Progress" | "Done" | "Cancelled"
  dueDate: string
  assignee: string
  progress: number
}

const mockOrders: ManufacturingOrder[] = [
  {
    id: "1",
    reference: "MO-2024-001",
    finishedProduct: "Steel Frame Assembly",
    quantity: 50,
    status: "In Progress",
    dueDate: "2024-01-15",
    assignee: "John Smith",
    progress: 65,
  },
  {
    id: "2",
    reference: "MO-2024-002",
    finishedProduct: "Aluminum Housing",
    quantity: 100,
    status: "Planned",
    dueDate: "2024-01-20",
    assignee: "Sarah Johnson",
    progress: 0,
  },
  {
    id: "3",
    reference: "MO-2024-003",
    finishedProduct: "Circuit Board PCB",
    quantity: 200,
    status: "Done",
    dueDate: "2024-01-10",
    assignee: "Mike Chen",
    progress: 100,
  },
  {
    id: "4",
    reference: "MO-2024-004",
    finishedProduct: "Motor Assembly",
    quantity: 25,
    status: "In Progress",
    dueDate: "2024-01-12",
    assignee: "Lisa Wang",
    progress: 30,
  },
  {
    id: "5",
    reference: "MO-2024-005",
    finishedProduct: "Sensor Module",
    quantity: 75,
    status: "Cancelled",
    dueDate: "2024-01-18",
    assignee: "David Brown",
    progress: 15,
  },
]

export default function DashboardPage() {
  const [orders, setOrders] = useState<ManufacturingOrder[]>(mockOrders)
  const [filteredOrders, setFilteredOrders] = useState<ManufacturingOrder[]>(mockOrders)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Filter orders based on status and search
  useEffect(() => {
    let filtered = orders

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.finishedProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.status.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchQuery])

  const getStatusBadge = (status: string) => {
    const variants = {
      Planned: "secondary",
      "In Progress": "default",
      Done: "default",
      Cancelled: "destructive",
    } as const

    const colors = {
      Planned: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Done: "bg-green-500/10 text-green-500 border-green-500/20",
      Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const kpis = {
    total: orders.length,
    completed: orders.filter((o) => o.status === "Done").length,
    inProgress: orders.filter((o) => o.status === "In Progress").length,
    delayed: orders.filter((o) => new Date(o.dueDate) < new Date() && o.status !== "Done").length,
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Profile Sidebar */}
          <ProfileSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:ml-64">
            {/* Header */}
            <AppHeader />

            <div className="flex-1 lg:mr-64">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Manufacturing Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Monitor and manage your production workflows</p>
                  </div>
                  <Button onClick={() => router.push("/manufacturing-orders/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpis.total}</div>
                      <p className="text-xs text-muted-foreground">All manufacturing orders</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Orders Completed</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">{kpis.completed}</div>
                      <p className="text-xs text-muted-foreground">Successfully finished</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Orders In Progress</CardTitle>
                      <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-500">{kpis.inProgress}</div>
                      <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Orders Delayed</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-500">{kpis.delayed}</div>
                      <p className="text-xs text-muted-foreground">Past due date</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by reference, product, or status..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Planned">Planned</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Manufacturing Orders Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Manufacturing Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Finished Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Assignee</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{order.reference}</TableCell>
                            <TableCell>{order.finishedProduct}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>{order.assignee}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${order.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-12">{order.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {filteredOrders.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No manufacturing orders found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Master Sidebar */}
          <MasterSidebar />
        </div>

        {/* Real-time sync status indicator */}
        <DataSyncStatus />
      </div>
    </ProtectedRoute>
  )
}
