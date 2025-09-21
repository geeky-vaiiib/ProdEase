"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Settings, Activity, Clock, DollarSign } from "lucide-react"
import { AppLayout } from "@/components/app-layout"

// Mock data for work centers
const mockWorkCenters = [
  {
    id: "WC001",
    name: "Assembly Line A",
    costPerHour: 45.0,
    capacity: 8,
    currentLoad: 6,
    status: "Active",
    downtime: 0,
    efficiency: 95,
    location: "Floor 1, Section A",
    description: "Primary assembly line for electronic components",
  },
  {
    id: "WC002",
    name: "CNC Machine Center",
    costPerHour: 85.0,
    capacity: 4,
    currentLoad: 3,
    status: "Active",
    downtime: 2,
    efficiency: 88,
    location: "Floor 2, Section B",
    description: "High-precision CNC machining center",
  },
  {
    id: "WC003",
    name: "Quality Control Station",
    costPerHour: 35.0,
    capacity: 6,
    currentLoad: 4,
    status: "Active",
    downtime: 0,
    efficiency: 92,
    location: "Floor 1, Section C",
    description: "Final quality inspection and testing",
  },
  {
    id: "WC004",
    name: "Packaging Line",
    costPerHour: 25.0,
    capacity: 10,
    currentLoad: 2,
    status: "Maintenance",
    downtime: 4,
    efficiency: 0,
    location: "Floor 1, Section D",
    description: "Product packaging and labeling",
  },
  {
    id: "WC005",
    name: "Welding Station",
    costPerHour: 55.0,
    capacity: 3,
    currentLoad: 3,
    status: "Active",
    downtime: 1,
    efficiency: 85,
    location: "Floor 2, Section A",
    description: "Metal welding and fabrication",
  },
]

export default function WorkCentersPage() {
  const [workCenters, setWorkCenters] = useState(mockWorkCenters)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const filteredWorkCenters = workCenters.filter((wc) => {
    const matchesSearch =
      wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || wc.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Maintenance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return "text-green-400"
    if (efficiency >= 75) return "text-yellow-400"
    return "text-red-400"
  }

  const totalCapacity = workCenters.reduce((sum, wc) => sum + wc.capacity, 0)
  const totalLoad = workCenters.reduce((sum, wc) => sum + wc.currentLoad, 0)
  const activeWorkCenters = workCenters.filter((wc) => wc.status === "Active").length
  const avgEfficiency = workCenters.reduce((sum, wc) => sum + wc.efficiency, 0) / workCenters.length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-2xl font-bold text-foreground">Work Centers</h1>
              <p className="text-muted-foreground mt-1">Manage production work centers and capacity</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Work Center
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Capacity</p>
                    <p className="text-2xl font-bold text-foreground">{totalCapacity}</p>
                  </div>
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Current Load</p>
                    <p className="text-2xl font-bold text-foreground">{totalLoad}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Centers</p>
                    <p className="text-2xl font-bold text-foreground">{activeWorkCenters}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-foreground">{avgEfficiency.toFixed(1)}%</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search work centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Active", "Maintenance", "Inactive"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Work Centers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkCenters.map((workCenter) => (
              <Card
                key={workCenter.id}
                className="bg-card border-border hover:border-accent-foreground/20 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{workCenter.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{workCenter.id}</p>
                    </div>
                    <Badge className={getStatusColor(workCenter.status)}>{workCenter.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{workCenter.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cost/Hour</p>
                      <p className="text-foreground font-medium">${workCenter.costPerHour}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="text-foreground font-medium">{workCenter.location}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Capacity Utilization</span>
                      <span className="text-foreground">
                        {workCenter.currentLoad}/{workCenter.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(workCenter.currentLoad / workCenter.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-muted-foreground">Efficiency: </span>
                      <span className={`font-medium ${getEfficiencyColor(workCenter.efficiency)}`}>
                        {workCenter.efficiency}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Downtime: </span>
                      <span className="text-foreground font-medium">{workCenter.downtime}h</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border text-muted-foreground hover:bg-accent bg-transparent"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </AppLayout>
  )
}
