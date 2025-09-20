"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Package, Wrench, FileText, Building, Archive, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Manufacturing Orders",
    href: "/manufacturing-orders",
    icon: Package,
  },
  {
    name: "Work Orders",
    href: "/work-orders",
    icon: Wrench,
  },
  {
    name: "Bills of Materials",
    href: "/bom",
    icon: FileText,
  },
  {
    name: "Work Centers",
    href: "/work-centers",
    icon: Building,
  },
  {
    name: "Stock Ledger",
    href: "/stock-ledger",
    icon: Archive,
  },
]

export function MasterSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 right-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-64 bg-sidebar border-l border-sidebar-border z-40 transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Master Menu</h2>
            <p className="text-sm text-muted-foreground">Manufacturing modules</p>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
