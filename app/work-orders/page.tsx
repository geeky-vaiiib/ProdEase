"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Play, Pause, CheckCircle, MoreHorizontal, Eye, MessageSquare } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"

interface WorkOrder {
  id: string
  reference: string
  operation: string
  workCenter: string
  finishedProduct: string
  manufacturingOrderRef: string
  status: "Planned" | "In Progress" | "Paused" | "Done" | "Cancelled"
  assignee: string
  estimatedDuration: number // in minutes
  actualDuration?: number // in minutes
  startTime?: string
  endTime?: string
  priority: "Low" | "Medium" | "High" | "Urgent"
  progress: number
  comments: Array<{
    id: string
    text: string
    author: string
    timestamp: string
    type: "comment" | "issue"
  }>
}

const mockWorkOrders: WorkOrder[] = [
  {
    id: "1",
    reference: "WO-2024-001",
    operation: "CNC Machining",
    workCenter: "CNC-01",
    finishedProduct: "Steel Frame Assembly",
    manufacturingOrderRef: "MO-2024-001",
    status: "In Progress",
    assignee: "Mike Chen",
    estimatedDuration: 120,
    actualDuration: 85,
    startTime: "2024-01-10T08:00:00",
    priority: "High",
    progress: 70,
    comments: [
      {
        id: "1",
        text: "Started machining operation. Material quality looks good.",
        author: "Mike Chen",
        timestamp: "2024-01-10T08:15:00",
        type: "comment",
      },
      {
        id: "2",
        text: "Tool wear detected on cutting bit #3. Replaced with new tool.",
        author: "Mike Chen",
        timestamp: "2024-01-10T09:30:00",
        type: "issue",
      },
    ],
  },
  {
    id: "2",
    reference: "WO-2024-002",
    operation: "Welding",
    workCenter: "WLD-01",
    finishedProduct: "Steel Frame Assembly",
    manufacturingOrderRef: "MO-2024-001",
    status: "Planned",
    assignee: "Sarah Johnson",
    estimatedDuration: 180,
    priority: "Medium",
    progress: 0,
    comments: [],
  },
  {
    id: "3",
    reference: "WO-2024-003",
    operation: "Quality Inspection",
    workCenter: "QC-01",
    finishedProduct: "Circuit Board PCB",
    manufacturingOrderRef: "MO-2024-003",
    status: "Done",
    assignee: "Lisa Wang",
    estimatedDuration: 60,
    actualDuration: 55,
    startTime: "2024-01-08T10:00:00",
    endTime: "2024-01-08T10:55:00",
    priority: "Medium",
    progress: 100,
    comments: [
      {
        id: "3",
        text: "All PCBs passed quality inspection. No defects found.",
        author: "Lisa Wang",
        timestamp: "2024-01-08T10:55:00",
        type: "comment",
      },
    ],
  },
  {
    id: "4",
    reference: "WO-2024-004",
    operation: "Assembly",
    workCenter: "ASM-01",
    finishedProduct: "Motor Assembly",
    manufacturingOrderRef: "MO-2024-004",
    status: "Paused",
    assignee: "David Brown",
    estimatedDuration: 150,
    actualDuration: 45,
    startTime: "2024-01-09T14:00:00",
    priority: "Urgent",
    progress: 30,
    comments: [
      {
        id: "4",
        text: "Paused due to missing components. Waiting for delivery.",
        author: "David Brown",
        timestamp: "2024-01-09T14:45:00",
        type: "issue",
      },
    ],
  },
]

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(mockWorkOrders)
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>(mockWorkOrders)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem("flowforge_user")
    if (!user) {
      router.push("/auth/login")
    }
  }, [router])

  // Filter by MO if specified in URL
  useEffect(() => {
    const moFilter = searchParams.get("mo")
    if (moFilter) {
      setFilteredOrders(workOrders.filter((wo) => wo.manufacturingOrderRef.includes(moFilter)))
    }
  }, [searchParams, workOrders])

  // Filter work orders
  useEffect(() => {
    let filtered = workOrders

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((order) => order.priority === priorityFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.workCenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.finishedProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.assignee.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Don't override MO filter if it exists
    if (!searchParams.get("mo")) {
      setFilteredOrders(filtered)
    }
  }, [workOrders, statusFilter, priorityFilter, searchQuery, searchParams])

  const getStatusBadge = (status: string) => {
    const colors = {
      Planned: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      Done: "bg-green-500/10 text-green-500 border-green-500/20",
      Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      Low: "bg-green-500/10 text-green-500 border-green-500/20",
      Medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Urgent: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>
  }

  const handleStatusChange = (workOrderId: string, newStatus: string) => {
    const now = new Date().toISOString()

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === workOrderId) {
          const updates: Partial<WorkOrder> = { status: newStatus as any }

          if (newStatus === "In Progress" && wo.status === "Planned") {
            updates.startTime = now
            updates.progress = 10
          } else if (newStatus === "Done") {
            updates.endTime = now
            updates.progress = 100
            if (wo.startTime) {
              const start = new Date(wo.startTime)
              const end = new Date(now)
              updates.actualDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
            }
          } else if (newStatus === "Paused") {
            // Keep current progress
          }

          return { ...wo, ...updates }
        }
        return wo
      }),
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const elapsed = Math.round((now.getTime() - start.getTime()) / (1000 * 60))
    return formatDuration(elapsed)
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
                  <h1 className="text-3xl font-bold text-foreground">Work Orders</h1>
                  <p className="text-muted-foreground mt-1">Track and manage individual operations</p>
                  {searchParams.get("mo") && (
                    <p className="text-sm text-primary mt-1">
                      Filtered by Manufacturing Order: {searchParams.get("mo")}
                    </p>
                  )}
                </div>
              </div>

              {/* Filters and Search */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by reference, operation, work center, or assignee..."
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
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Work Orders Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Orders ({filteredOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Operation</TableHead>
                        <TableHead>Work Center</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((workOrder) => (
                        <TableRow key={workOrder.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Link href={`/work-orders/${workOrder.id}`} className="text-primary hover:underline">
                              {workOrder.reference}
                            </Link>
                          </TableCell>
                          <TableCell>{workOrder.operation}</TableCell>
                          <TableCell>{workOrder.workCenter}</TableCell>
                          <TableCell>{workOrder.finishedProduct}</TableCell>
                          <TableCell>{workOrder.assignee}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {workOrder.actualDuration ? (
                                <div>
                                  <div className="font-medium">{formatDuration(workOrder.actualDuration)}</div>
                                  <div className="text-muted-foreground">
                                    {formatDuration(workOrder.estimatedDuration)} est.
                                  </div>
                                </div>
                              ) : workOrder.status === "In Progress" && workOrder.startTime ? (
                                <div>
                                  <div className="font-medium text-blue-500">{getElapsedTime(workOrder.startTime)}</div>
                                  <div className="text-muted-foreground">
                                    {formatDuration(workOrder.estimatedDuration)} est.
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground">
                                  {formatDuration(workOrder.estimatedDuration)} est.
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(workOrder.status)}</TableCell>
                          <TableCell>{getPriorityBadge(workOrder.priority)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${workOrder.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-12">{workOrder.progress}%</span>
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
                                  <Link href={`/work-orders/${workOrder.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {workOrder.status === "Planned" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(workOrder.id, "In Progress")}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Work
                                  </DropdownMenuItem>
                                )}
                                {workOrder.status === "In Progress" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(workOrder.id, "Paused")}>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Pause Work
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(workOrder.id, "Done")}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Complete Work
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {workOrder.status === "Paused" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(workOrder.id, "In Progress")}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume Work
                                  </DropdownMenuItem>
                                )}
                                {workOrder.comments.length > 0 && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/work-orders/${workOrder.id}#comments`}>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      View Comments ({workOrder.comments.length})
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No work orders found</p>
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
