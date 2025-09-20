"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Calendar, TrendingUp, BarChart3 } from "lucide-react"
import { MasterSidebar } from "@/components/master-sidebar"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { ProtectedRoute } from "@/components/protected-route"

const mockReports = [
  {
    id: "1",
    name: "Manufacturing Orders Summary",
    type: "Production",
    generatedDate: "2024-01-15",
    status: "Ready",
  },
  {
    id: "2",
    name: "Work Center Efficiency",
    type: "Performance",
    generatedDate: "2024-01-14",
    status: "Ready",
  },
  {
    id: "3",
    name: "BOM Cost Analysis",
    type: "Financial",
    generatedDate: "2024-01-13",
    status: "Ready",
  },
  {
    id: "4",
    name: "Stock Movement Report",
    type: "Inventory",
    generatedDate: "2024-01-12",
    status: "Ready",
  },
]

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("last-30-days")

  const filteredReports = reportType === "all" 
    ? mockReports 
    : mockReports.filter(report => report.type === reportType)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <ProfileSidebar />
          
          <div className="flex-1 flex flex-col lg:ml-64">
            <div className="flex-1 lg:mr-64">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
                    <p className="text-muted-foreground mt-1">View and download your reports</p>
                  </div>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{mockReports.length}</div>
                      <p className="text-xs text-muted-foreground">Available for download</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">Reports generated</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Most Used</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Production</div>
                      <p className="text-xs text-muted-foreground">Report category</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Production">Production</SelectItem>
                          <SelectItem value="Performance">Performance</SelectItem>
                          <SelectItem value="Financial">Financial</SelectItem>
                          <SelectItem value="Inventory">Inventory</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Last 7 days</SelectItem>
                          <SelectItem value="last-30-days">Last 30 days</SelectItem>
                          <SelectItem value="last-90-days">Last 90 days</SelectItem>
                          <SelectItem value="this-year">This year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Reports Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Report Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Generated Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.name}</TableCell>
                            <TableCell>{report.type}</TableCell>
                            <TableCell>{new Date(report.generatedDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                {report.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <MasterSidebar />
        </div>
      </div>
    </ProtectedRoute>
  )
}
