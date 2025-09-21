"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Play, Pause, CheckCircle, Package, Calendar, Hash, User, Filter } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { EditableField } from "@/components/editable-field"
import { AddManufacturingOrderModal } from "@/components/add-manufacturing-order-modal"
import { manufacturingOrdersApi, type ManufacturingOrder } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"

// ManufacturingOrder interface is now imported from @/lib/api

export default function ManufacturingOrdersPage() {
  const [filteredOrders, setFilteredOrders] = useState<ManufacturingOrder[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { user } = useAuth()
  const { manufacturingOrders: orders, isLoading, error, updateOrder, updateOrderStatus, deleteOrder, clearError } = useData()

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  // Filter orders
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
          (order.assignee?.username || '').toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchQuery])

  // Handle status change with real-time updates
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (err) {
      console.error("Error updating status:", err)
      // Error handling is done in the context
    }
  }

  // Handle delete with real-time updates
  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this manufacturing order?")) {
      try {
        await deleteOrder(orderId)
      } catch (err) {
        console.error("Error deleting order:", err)
        // Error handling is done in the context
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      Confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "In Progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "To Close": "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Done: "bg-green-500/10 text-green-500 border-green-500/20",
      Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }



  // Handle field updates with real-time updates
  const handleFieldUpdate = async (orderId: string, field: string, value: string | number) => {
    try {
      const updateData = { [field]: value }
      await updateOrder(orderId, updateData)
    } catch (err) {
      console.error(`Error updating ${field}:`, err)
      throw new Error(`Failed to update ${field}`)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manufacturing Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your manufacturing orders
            </p>
          </div>
          <AddManufacturingOrderModal />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
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
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">No orders found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first manufacturing order."
                  }
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <div className="mt-6">
                    <AddManufacturingOrderModal />
                  </div>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        <EditableField
                          value={order.reference}
                          onSave={(value) => handleFieldUpdate(order._id, "reference", value)}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableField
                          value={order.finishedProduct}
                          onSave={(value) => handleFieldUpdate(order._id, "finishedProduct", value)}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableField
                          value={order.quantity.toString()}
                          type="number"
                          onSave={(value) => handleFieldUpdate(order._id, "quantity", parseInt(value))}
                        />
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "Not set"}
                      </TableCell>
                      <TableCell>
                        <EditableField
                          value={order.assignee?.username || "Unassigned"}
                          onSave={(value) => handleFieldUpdate(order._id, "assignee", value)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteOrder(order._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
