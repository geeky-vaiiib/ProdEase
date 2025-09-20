"use client"

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
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Play, Pause, CheckCircle, Package, Calendar, Hash, User } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { EditableField } from "@/components/editable-field"
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
  const { orders, isLoading, error, updateOrder, updateOrderStatus, deleteOrder, clearError } = useData()

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
    <div className="min-h-screen bg-background">
      <div className="flex">
        <ProfileSidebar />

        <div className="flex-1 flex flex-col lg:ml-64">
          <div className="flex-1 lg:mr-64">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Manufacturing Orders</h1>
                  <p className="text-muted-foreground mt-1">Create, track, and manage production orders</p>
                </div>
                <Button asChild>
                  <Link href="/manufacturing-orders/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Manufacturing Order
                  </Link>
                </Button>
              </div>

              {/* Filters and Search */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by reference, product, or assignee..."
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
                        <SelectItem value="To Close">To Close</SelectItem>
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
                  <CardTitle>Manufacturing Orders ({filteredOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Finished Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            Loading manufacturing orders...
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-destructive">
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No manufacturing orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow key={order._id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <Link href={`/manufacturing-orders/${order._id}`} className="text-primary hover:underline">
                                {order.reference}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <EditableField
                                value={order.finishedProduct}
                                onSave={(value) => handleFieldUpdate(order._id, 'finishedProduct', value)}
                                icon={<Package className="h-3 w-3" />}
                                placeholder="Product name"
                              />
                            </TableCell>
                            <TableCell>
                              <EditableField
                                value={order.quantity}
                                onSave={(value) => handleFieldUpdate(order._id, 'quantity', value)}
                                type="number"
                                icon={<Hash className="h-3 w-3" />}
                                validation={(value) => {
                                  const num = Number(value);
                                  if (num <= 0) return "Quantity must be greater than 0";
                                  return null;
                                }}
                              />
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <EditableField
                                value={order.scheduledStartDate.split('T')[0]}
                                onSave={(value) => handleFieldUpdate(order._id, 'scheduledStartDate', value)}
                                type="date"
                                icon={<Calendar className="h-3 w-3" />}
                              />
                            </TableCell>
                            <TableCell>
                              <EditableField
                                value={order.dueDate.split('T')[0]}
                                onSave={(value) => handleFieldUpdate(order._id, 'dueDate', value)}
                                type="date"
                                icon={<Calendar className="h-3 w-3" />}
                              />
                            </TableCell>
                            <TableCell>
                              <EditableField
                                value={order.assignee?.username || 'Unassigned'}
                                onSave={(value) => handleFieldUpdate(order._id, 'assignee', value)}
                                icon={<User className="h-3 w-3" />}
                                placeholder="Assignee"
                              />
                            </TableCell>
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/manufacturing-orders/${order._id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/manufacturing-orders/${order._id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                {order.status === "Confirmed" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(order._id, "In Progress")}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Production
                                  </DropdownMenuItem>
                                )}
                                {order.status === "In Progress" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(order._id, "To Close")}>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Mark To Close
                                  </DropdownMenuItem>
                                )}
                                {order.status === "To Close" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(order._id, "Done")}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete Order
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDeleteOrder(order._id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No manufacturing orders found</p>
                      <Button asChild className="mt-4">
                        <Link href="/manufacturing-orders/new">Create your first manufacturing order</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <MasterSidebar />
      </div>
    </div>
  )
}
