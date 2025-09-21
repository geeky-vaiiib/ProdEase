"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  User,
  Calendar,
  Timer,
} from "lucide-react"
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
  estimatedDuration: number
  actualDuration?: number
  startTime?: string
  endTime?: string
  priority: "Low" | "Medium" | "High" | "Urgent"
  progress: number
  description?: string
  instructions?: string
  comments: Array<{
    id: string
    text: string
    author: string
    timestamp: string
    type: "comment" | "issue"
  }>
}

// Mock data
const mockWorkOrder: WorkOrder = {
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
  description: "Machine steel tubes to precise specifications for frame assembly",
  instructions:
    "1. Load steel tubes into CNC machine\n2. Set cutting parameters: Speed 1200 RPM, Feed 0.2mm/rev\n3. Run quality check every 10 pieces\n4. Deburr all cut edges",
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
    {
      id: "3",
      text: "Quality check passed for first batch of 10 pieces.",
      author: "Mike Chen",
      timestamp: "2024-01-10T10:00:00",
      type: "comment",
    },
  ],
}

export default function WorkOrderDetailPage() {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [newComment, setNewComment] = useState("")
  const [commentType, setCommentType] = useState<"comment" | "issue">("comment")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem("prodease_user")
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Mock API call to fetch work order details
    const fetchWorkOrder = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setWorkOrder(mockWorkOrder)
      } catch (error) {
        console.error("Failed to fetch work order:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkOrder()
  }, [router, params.id])

  const handleStatusChange = (newStatus: string) => {
    if (!workOrder) return

    const now = new Date().toISOString()
    const updates: Partial<WorkOrder> = { status: newStatus as any }

    if (newStatus === "In Progress" && workOrder.status === "Planned") {
      updates.startTime = now
      updates.progress = 10
    } else if (newStatus === "Done") {
      updates.endTime = now
      updates.progress = 100
      if (workOrder.startTime) {
        const start = new Date(workOrder.startTime)
        const end = new Date(now)
        updates.actualDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      }
    }

    setWorkOrder((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !workOrder) return

    setIsSubmittingComment(true)
    try {
      const user = JSON.parse(localStorage.getItem("flowforge_user") || "{}")
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: user.loginId || "Unknown User",
        timestamp: new Date().toISOString(),
        type: commentType,
      }

      setWorkOrder((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, comment],
            }
          : null,
      )

      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading work order...</p>
        </div>
      </div>
    )
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Work order not found</p>
          <Button asChild className="mt-4">
            <Link href="/work-orders">Back to Work Orders</Link>
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
                    <Link href="/work-orders">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{workOrder.reference}</h1>
                    <p className="text-muted-foreground mt-1">
                      {workOrder.operation} - {workOrder.workCenter}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(workOrder.status)}
                  {getPriorityBadge(workOrder.priority)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Work Order Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Work Order Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Assignee</p>
                            <p className="font-medium">{workOrder.assignee}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="font-medium">
                              {workOrder.actualDuration
                                ? `${formatDuration(workOrder.actualDuration)} (${formatDuration(workOrder.estimatedDuration)} est.)`
                                : `${formatDuration(workOrder.estimatedDuration)} est.`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Manufacturing Order</p>
                            <Link
                              href={`/manufacturing-orders/${workOrder.manufacturingOrderRef.split("-")[2]}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {workOrder.manufacturingOrderRef}
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {workOrder.status === "In Progress" ? "Elapsed Time" : "Start Time"}
                            </p>
                            <p className="font-medium">
                              {workOrder.startTime
                                ? workOrder.status === "In Progress"
                                  ? getElapsedTime(workOrder.startTime)
                                  : formatTimestamp(workOrder.startTime)
                                : "Not started"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {workOrder.description && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="font-medium">{workOrder.description}</p>
                        </div>
                      )}

                      {workOrder.instructions && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">Instructions</p>
                          <pre className="font-medium whitespace-pre-wrap text-sm bg-muted p-3 rounded-lg mt-1">
                            {workOrder.instructions}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Comments and Issues */}
                  <Card id="comments">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments & Issues ({workOrder.comments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {workOrder.comments.map((comment) => (
                          <div key={comment.id} className="border-l-2 border-muted pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              {comment.type === "issue" ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                              <Badge
                                variant={comment.type === "issue" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {comment.type}
                              </Badge>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        ))}

                        {/* Add Comment Form */}
                        <div className="border-t pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="commentType">Type:</Label>
                              <Select
                                value={commentType}
                                onValueChange={(value: "comment" | "issue") => setCommentType(value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="comment">Comment</SelectItem>
                                  <SelectItem value="issue">Issue</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Textarea
                              placeholder="Add a comment or report an issue..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={3}
                            />
                            <Button
                              onClick={handleAddComment}
                              disabled={!newComment.trim() || isSubmittingComment}
                              size="sm"
                            >
                              {isSubmittingComment ? "Adding..." : "Add Comment"}
                            </Button>
                          </div>
                        </div>
                      </div>
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
                            <span>Completion</span>
                            <span>{workOrder.progress}%</span>
                          </div>
                          <Progress value={workOrder.progress} className="h-2" />
                        </div>

                        {workOrder.status === "In Progress" && workOrder.startTime && (
                          <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                              Work in progress for {getElapsedTime(workOrder.startTime)}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {workOrder.status === "Planned" && (
                        <Button className="w-full" onClick={() => handleStatusChange("In Progress")}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Work
                        </Button>
                      )}
                      {workOrder.status === "In Progress" && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => handleStatusChange("Paused")}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Work
                          </Button>
                          <Button className="w-full" onClick={() => handleStatusChange("Done")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Work
                          </Button>
                        </>
                      )}
                      {workOrder.status === "Paused" && (
                        <Button className="w-full" onClick={() => handleStatusChange("In Progress")}>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Work
                        </Button>
                      )}
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <Link href={`/manufacturing-orders/${workOrder.manufacturingOrderRef.split("-")[2]}`}>
                          View Manufacturing Order
                        </Link>
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
