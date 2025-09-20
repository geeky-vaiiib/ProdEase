"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ManufacturingOrder {
  id: string
  reference: string
  finishedProduct: string
  quantity: number
  status: "Draft" | "Confirmed" | "In Progress" | "To Close" | "Done" | "Cancelled"
  dueDate: string
  assignee: string
  progress: number
  bomId?: string
  components: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    cost: number
  }>
  workOrders: Array<{
    id: string
    operation: string
    workCenter: string
    status: "Pending" | "In Progress" | "Completed"
    duration: number
  }>
}

interface WorkOrder {
  id: string
  moId: string
  operation: string
  workCenter: string
  finishedProduct: string
  expectedDuration: number
  realDuration: number
  status: "Pending" | "In Progress" | "Paused" | "Completed"
  assignee: string
  startTime?: string
  endTime?: string
  comments: Array<{
    id: string
    text: string
    timestamp: string
    author: string
  }>
}

interface BillOfMaterials {
  id: string
  finishedProduct: string
  version: string
  status: "Draft" | "Active" | "Archived"
  components: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    cost: number
  }>
  operations: Array<{
    id: string
    name: string
    workCenter: string
    duration: number
    sequence: number
  }>
  totalCost: number
  totalTime: number
}

interface ManufacturingContextType {
  manufacturingOrders: ManufacturingOrder[]
  workOrders: WorkOrder[]
  billsOfMaterials: BillOfMaterials[]
  updateManufacturingOrder: (id: string, updates: Partial<ManufacturingOrder>) => void
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void
  updateBOM: (id: string, updates: Partial<BillOfMaterials>) => void
  addManufacturingOrder: (order: Omit<ManufacturingOrder, "id">) => void
  addWorkOrder: (workOrder: Omit<WorkOrder, "id">) => void
  addBOM: (bom: Omit<BillOfMaterials, "id">) => void
}

const ManufacturingContext = createContext<ManufacturingContextType | undefined>(undefined)

export function ManufacturingProvider({ children }: { children: ReactNode }) {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([])
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [billsOfMaterials, setBillsOfMaterials] = useState<BillOfMaterials[]>([])

  const updateManufacturingOrder = (id: string, updates: Partial<ManufacturingOrder>) => {
    setManufacturingOrders((prev) => prev.map((order) => (order.id === id ? { ...order, ...updates } : order)))
  }

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) => prev.map((workOrder) => (workOrder.id === id ? { ...workOrder, ...updates } : workOrder)))
  }

  const updateBOM = (id: string, updates: Partial<BillOfMaterials>) => {
    setBillsOfMaterials((prev) => prev.map((bom) => (bom.id === id ? { ...bom, ...updates } : bom)))
  }

  const addManufacturingOrder = (order: Omit<ManufacturingOrder, "id">) => {
    const newOrder = { ...order, id: `MO-${Date.now()}` }
    setManufacturingOrders((prev) => [...prev, newOrder])
  }

  const addWorkOrder = (workOrder: Omit<WorkOrder, "id">) => {
    const newWorkOrder = { ...workOrder, id: `WO-${Date.now()}` }
    setWorkOrders((prev) => [...prev, newWorkOrder])
  }

  const addBOM = (bom: Omit<BillOfMaterials, "id">) => {
    const newBOM = { ...bom, id: `BOM-${Date.now()}` }
    setBillsOfMaterials((prev) => [...prev, newBOM])
  }

  return (
    <ManufacturingContext.Provider
      value={{
        manufacturingOrders,
        workOrders,
        billsOfMaterials,
        updateManufacturingOrder,
        updateWorkOrder,
        updateBOM,
        addManufacturingOrder,
        addWorkOrder,
        addBOM,
      }}
    >
      {children}
    </ManufacturingContext.Provider>
  )
}

export function useManufacturing() {
  const context = useContext(ManufacturingContext)
  if (context === undefined) {
    throw new Error("useManufacturing must be used within a ManufacturingProvider")
  }
  return context
}
