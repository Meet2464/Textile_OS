"use client"

import { useState, Fragment } from "react"
import { Search, Plus, Filter, Eye, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { AddOrderDrawer } from "./add-order-drawer"
import { useOrders } from "@/hooks/use-orders"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-[#FF6B35]/20", text: "text-[#FF6B35]" },
  in_production: { bg: "bg-[#3B82F6]/20", text: "text-[#3B82F6]" },
  checking: { bg: "bg-[#8B5CF6]/20", text: "text-[#8B5CF6]" },
  delivered: { bg: "bg-[#10B981]/20", text: "text-[#10B981]" },
  cancelled: { bg: "bg-[#E94560]/20", text: "text-[#E94560]" },
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_production: "In Production",
  checking: "Checking",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export function OrdersTable() {
  const { orders, loading, deleteOrder } = useOrders()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      `PO-${order.po_number}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.party_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-10 pr-8 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_production">In Production</option>
              <option value="checking">Checking</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B35] text-white font-medium text-sm hover:bg-[#FF6B35]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#555555]/50">
                  <th className="w-10"></th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">P.O.No</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Party Name</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden sm:table-cell">P.O.Date</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden md:table-cell">Designs</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden lg:table-cell">Total Qty</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <Fragment key={order.id}>
                    <tr
                      className="border-b border-[#555555]/30 hover:bg-[#1A1A2E]/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <td className="pl-4 py-3">
                        <button className="p-1 rounded hover:bg-[#555555]/50 transition-colors">
                          {expandedOrder === order.id ? (
                            <ChevronUp className="w-4 h-4 text-white/60" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white/60" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[#FF6B35]">PO-{order.po_number}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{order.party_name}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-white/60">
                          {new Date(order.order_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-white/80">{order.order_lines?.length || 0}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-white/80">{order.total_quantity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                            statusStyles[order.status]?.bg,
                            statusStyles[order.status]?.text
                          )}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1.5 rounded-lg hover:bg-[#555555]/50 text-white/60 hover:text-white transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-[#555555]/50 text-[#3B82F6] hover:text-[#3B82F6] transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 rounded-lg hover:bg-[#555555]/50 text-[#E94560] hover:text-[#E94560] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Row */}
                    {expandedOrder === order.id && (
                      <tr className="bg-[#1A1A2E]/80">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Design Details</p>
                            <div className="grid gap-2">
                              {(order.order_lines || []).map((line) => (
                                <div
                                  key={line.id}
                                  className="flex items-center justify-between bg-[#2A2A2A] rounded-lg px-4 py-3"
                                >
                                  <div className="flex items-center gap-6">
                                    <span className="text-sm font-medium text-[#FFD700]">{line.design_number}</span>
                                    <span className="text-sm text-white/80">Qty: {line.quantity}</span>
                                  </div>
                                  <span
                                    className={cn(
                                      "px-2.5 py-1 rounded-full text-xs font-medium",
                                      line.status === "pending" && "bg-[#FF6B35]/20 text-[#FF6B35]",
                                      line.status === "sent" && "bg-[#FFD700]/20 text-[#FFD700]",
                                      line.status === "received" && "bg-[#00BCD4]/20 text-[#00BCD4]",
                                      line.status === "done" && "bg-[#10B981]/20 text-[#10B981]"
                                    )}
                                  >
                                    {line.status}
                                  </span>
                                </div>
                              ))}
                              {(!order.order_lines || order.order_lines.length === 0) && (
                                <p className="text-sm text-white/40 text-center py-4">No design lines</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-[#1A1A2E] flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-lg font-medium text-white">No orders found</h3>
              <p className="text-sm text-white/50 mt-1">
                {searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first order"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Order Drawer */}
      <AddOrderDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </div>
  )
}
