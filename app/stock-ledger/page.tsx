"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, TrendingUp, TrendingDown, Package, AlertTriangle, Filter } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { AddStockItemModal } from "@/components/add-stock-item-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for stock ledger
const mockStockItems = [
  {
    id: "SKU001",
    name: "Steel Rod 10mm",
    category: "Raw Materials",
    unitCost: 12.5,
    onHand: 450,
    freeToUse: 380,
    reserved: 70,
    reorderLevel: 100,
    maxStock: 1000,
    unit: "pieces",
    supplier: "MetalCorp Ltd",
    lastUpdated: "2024-01-15",
    movements: [
      { type: "IN", quantity: 200, date: "2024-01-15", reference: "PO-2024-001" },
      { type: "OUT", quantity: 50, date: "2024-01-14", reference: "MO-2024-003" },
    ],
  },
  {
    id: "SKU002",
    name: "Electronic Circuit Board",
    category: "Components",
    unitCost: 45.0,
    onHand: 25,
    freeToUse: 15,
    reserved: 10,
    reorderLevel: 50,
    maxStock: 200,
    unit: "pieces",
    supplier: "TechComponents Inc",
    lastUpdated: "2024-01-14",
    movements: [
      { type: "OUT", quantity: 5, date: "2024-01-14", reference: "MO-2024-002" },
      { type: "IN", quantity: 30, date: "2024-01-12", reference: "PO-2024-002" },
    ],
  },
  {
    id: "SKU003",
    name: "Aluminum Sheet 2mm",
    category: "Raw Materials",
    unitCost: 8.75,
    onHand: 120,
    freeToUse: 95,
    reserved: 25,
    reorderLevel: 80,
    maxStock: 500,
    unit: "sheets",
    supplier: "AlumCorp",
    lastUpdated: "2024-01-13",
    movements: [
      { type: "OUT", quantity: 15, date: "2024-01-13", reference: "MO-2024-001" },
      { type: "IN", quantity: 50, date: "2024-01-10", reference: "PO-2024-003" },
    ],
  },
  {
    id: "SKU004",
    name: "Hydraulic Pump",
    category: "Finished Goods",
    unitCost: 250.0,
    onHand: 8,
    freeToUse: 8,
    reserved: 0,
    reorderLevel: 5,
    maxStock: 50,
    unit: "pieces",
    supplier: "Internal Production",
    lastUpdated: "2024-01-15",
    movements: [
      { type: "IN", quantity: 3, date: "2024-01-15", reference: "MO-2024-004" },
      { type: "OUT", quantity: 2, date: "2024-01-12", reference: "SO-2024-001" },
    ],
  },
  {
    id: "SKU005",
    name: "Plastic Housing",
    category: "Components",
    unitCost: 15.25,
    onHand: 5,
    freeToUse: 0,
    reserved: 5,
    reorderLevel: 30,
    maxStock: 150,
    unit: "pieces",
    supplier: "PlasticWorks",
    lastUpdated: "2024-01-14",
    movements: [
      { type: "OUT", quantity: 25, date: "2024-01-14", reference: "MO-2024-005" },
      { type: "IN", quantity: 20, date: "2024-01-11", reference: "PO-2024-004" },
    ],
  },
]

export default function StockLedgerPage() {
  const [stockItems, setStockItems] = useState(mockStockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (item) => {
    if (item.onHand <= item.reorderLevel)
      return { status: "Low Stock", color: "bg-red-500/20 text-red-400 border-red-500/30" }
    if (item.onHand <= item.reorderLevel * 1.5)
      return { status: "Reorder Soon", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    return { status: "In Stock", color: "bg-green-500/20 text-green-400 border-green-500/30" }
  }

  const totalValue = stockItems.reduce((sum, item) => sum + item.onHand * item.unitCost, 0)
  const lowStockItems = stockItems.filter((item) => item.onHand <= item.reorderLevel).length
  const totalItems = stockItems.length
  const categories = [...new Set(stockItems.map((item) => item.category))].length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Ledger</h1>
            <p className="text-muted-foreground mt-1">Manage inventory and track stock movements</p>
          </div>
          <AddStockItemModal />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Items</p>
                    <p className="text-2xl font-bold text-foreground">{totalItems}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Low Stock Items</p>
                    <p className="text-2xl font-bold text-foreground">{lowStockItems}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Categories</p>
                    <p className="text-2xl font-bold text-foreground">{categories}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search stock items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder-muted-foreground"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Raw Materials", "Components", "Finished Goods"].map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  onClick={() => setCategoryFilter(category)}
                  className={
                    categoryFilter === category
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Stock Items Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Stock Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="p-4 text-muted-foreground font-medium">Item</th>
                      <th className="p-4 text-muted-foreground font-medium">Category</th>
                      <th className="p-4 text-muted-foreground font-medium">Unit Cost</th>
                      <th className="p-4 text-muted-foreground font-medium">On Hand</th>
                      <th className="p-4 text-muted-foreground font-medium">Free to Use</th>
                      <th className="p-4 text-muted-foreground font-medium">Status</th>
                      <th className="p-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const stockStatus = getStockStatus(item)
                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-accent/50">
                          <td className="p-4">
                            <div>
                              <p className="text-foreground font-medium">{item.name}</p>
                              <p className="text-muted-foreground text-sm">{item.id}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="border-border text-muted-foreground">
                              {item.category}
                            </Badge>
                          </td>
                          <td className="p-4 text-foreground">${item.unitCost}</td>
                          <td className="p-4">
                            <div>
                              <p className="text-foreground font-medium">
                                {item.onHand} {item.unit}
                              </p>
                              <p className="text-muted-foreground text-sm">Reserved: {item.reserved}</p>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">
                            {item.freeToUse} {item.unit}
                          </td>
                          <td className="p-4">
                            <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-border text-muted-foreground hover:bg-accent bg-transparent"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-700 text-blue-400 hover:bg-blue-900/20 bg-transparent"
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      </div>
    </AppLayout>
  )
}
