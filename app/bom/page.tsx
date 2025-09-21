"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, FileText, Package } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { useAuth } from "@/contexts/auth-context"

interface BOM {
  id: string
  reference: string
  finishedProduct: string
  version: string
  status: "Draft" | "Active" | "Obsolete"
  createdBy: string
  createdDate: string
  lastModified: string
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

const mockBOMs: BOM[] = [
  {
    id: "1",
    reference: "BOM-001",
    finishedProduct: "Steel Frame Assembly",
    version: "1.2",
    status: "Active",
    createdBy: "John Smith",
    createdDate: "2024-01-01",
    lastModified: "2024-01-05",
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
      },
      {
        id: "2",
        name: "Welding Rod",
        quantity: 0.2,
        unit: "kg",
        unitCost: 15.0,
        totalCost: 3.0,
        supplier: "Weld Supply",
      },
      {
        id: "3",
        name: "Paint Primer",
        quantity: 0.1,
        unit: "L",
        unitCost: 22.5,
        totalCost: 2.25,
        supplier: "Paint Co",
      },
    ],
    operations: [
      { id: "1", sequence: 10, operation: "Cutting", workCenter: "CNC-01", setupTime: 15, runTime: 30 },
      { id: "2", sequence: 20, operation: "Welding", workCenter: "WLD-01", setupTime: 10, runTime: 45 },
      { id: "3", sequence: 30, operation: "Painting", workCenter: "PNT-01", setupTime: 5, runTime: 20 },
    ],
  },
  {
    id: "2",
    reference: "BOM-002",
    finishedProduct: "Aluminum Housing",
    version: "2.0",
    status: "Active",
    createdBy: "Sarah Johnson",
    createdDate: "2024-01-03",
    lastModified: "2024-01-08",
    totalComponents: 2,
    estimatedCost: 45.75,
    components: [
      {
        id: "4",
        name: "Aluminum Sheet 2mm",
        quantity: 0.5,
        unit: "pcs",
        unitCost: 80.0,
        totalCost: 40.0,
        supplier: "Aluminum Inc",
      },
      { id: "5", name: "Rivets", quantity: 5, unit: "pcs", unitCost: 1.15, totalCost: 5.75, supplier: "Fastener Co" },
    ],
    operations: [
      { id: "3", sequence: 10, operation: "Stamping", workCenter: "STP-01", setupTime: 20, runTime: 15 },
      { id: "4", sequence: 20, operation: "Assembly", workCenter: "ASM-01", setupTime: 5, runTime: 25 },
    ],
  },
  {
    id: "3",
    reference: "BOM-003",
    finishedProduct: "Circuit Board PCB",
    version: "1.0",
    status: "Draft",
    createdBy: "Mike Chen",
    createdDate: "2024-01-10",
    lastModified: "2024-01-10",
    totalComponents: 2,
    estimatedCost: 18.5,
    components: [
      {
        id: "6",
        name: "PCB Substrate",
        quantity: 1,
        unit: "pcs",
        unitCost: 15.0,
        totalCost: 15.0,
        supplier: "PCB Fab",
      },
      {
        id: "7",
        name: "Solder Paste",
        quantity: 0.01,
        unit: "kg",
        unitCost: 350.0,
        totalCost: 3.5,
        supplier: "Electronics Supply",
      },
    ],
    operations: [
      { id: "5", sequence: 10, operation: "SMT Assembly", workCenter: "SMT-01", setupTime: 30, runTime: 60 },
    ],
  },
]

export default function BOMPage() {
  const [boms, setBOMs] = useState<BOM[]>(mockBOMs)
  const [filteredBOMs, setFilteredBOMs] = useState<BOM[]>(mockBOMs)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  // Filter BOMs
  useEffect(() => {
    let filtered = boms

    if (searchQuery) {
      filtered = filtered.filter(
        (bom) =>
          bom.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bom.finishedProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bom.createdBy.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredBOMs(filtered)
  }, [boms, searchQuery])

  const getStatusBadge = (status: string) => {
    const colors = {
      Draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      Active: "bg-green-500/10 text-green-500 border-green-500/20",
      Obsolete: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const handleDelete = (bomId: string) => {
    if (confirm("Are you sure you want to delete this BOM?")) {
      setBOMs((prev) => prev.filter((bom) => bom.id !== bomId))
    }
  }

  const handleStatusChange = (bomId: string, newStatus: string) => {
    setBOMs((prev) =>
      prev.map((bom) =>
        bom.id === bomId
          ? { ...bom, status: newStatus as any, lastModified: new Date().toISOString().split("T")[0] }
          : bom,
      ),
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bills of Materials</h1>
            <p className="text-muted-foreground mt-1">Manage product structures and component requirements</p>
          </div>
          <Button asChild>
            <Link href="/bom/new">
              <Plus className="h-4 w-4 mr-2" />
              New BOM
            </Link>
          </Button>
              </div>

              {/* Search */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by reference, product, or creator..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* BOMs Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Bills of Materials ({filteredBOMs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Finished Product</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Components</TableHead>
                        <TableHead>Est. Cost</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBOMs.map((bom) => (
                        <TableRow key={bom.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <Link href={`/bom/${bom.id}`} className="text-primary hover:underline">
                              {bom.reference}
                            </Link>
                          </TableCell>
                          <TableCell>{bom.finishedProduct}</TableCell>
                          <TableCell>{bom.version}</TableCell>
                          <TableCell>{getStatusBadge(bom.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {bom.totalComponents}
                            </div>
                          </TableCell>
                          <TableCell>${bom.estimatedCost.toFixed(2)}</TableCell>
                          <TableCell>{bom.createdBy}</TableCell>
                          <TableCell>{new Date(bom.lastModified).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/bom/${bom.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/bom/${bom.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                {bom.status === "Draft" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(bom.id, "Active")}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Activate BOM
                                  </DropdownMenuItem>
                                )}
                                {bom.status === "Active" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(bom.id, "Obsolete")}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Mark Obsolete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleDelete(bom.id)} className="text-destructive">
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

                  {filteredBOMs.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No bills of materials found</p>
                      <Button asChild className="mt-4">
                        <Link href="/bom/new">Create your first BOM</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
      </div>
    </AppLayout>
  )
}
