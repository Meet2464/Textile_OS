"use client"

import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useInventory } from "@/hooks/use-inventory"

export function InventoryDashboard() {
  const { inventory, movements, loading, lowStockItems } = useInventory()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    )
  }

  const totalPieces = inventory.reduce((sum, i) => sum + i.current_pieces, 0)
  const totalMetres = inventory.reduce((sum, i) => sum + i.current_metres, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <p className="text-sm text-white/60">Total Stock Items</p>
          <p className="text-3xl font-bold text-[#FFD700] mt-1">{inventory.length}</p>
        </div>
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <p className="text-sm text-white/60">Total Pieces</p>
          <p className="text-3xl font-bold text-[#10B981] mt-1">{totalPieces.toLocaleString()}</p>
        </div>
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Low Stock Alerts</p>
            {lowStockItems.length > 0 && <AlertTriangle className="w-5 h-5 text-[#E94560]" />}
          </div>
          <p className="text-3xl font-bold text-[#E94560] mt-1">{lowStockItems.length}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-[#E94560]/10 border border-[#E94560]/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#E94560] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Low Stock Items
          </h3>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-[#2A2A2A] rounded-lg px-4 py-3">
                <span className="text-sm text-white">{item.saree_type} Saree</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#E94560]">{item.current_pieces} pcs</span>
                  <span className="text-xs text-white/40">min: {item.minimum_stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
        <div className="p-4 border-b border-[#555555]/50">
          <h3 className="text-lg font-semibold text-white">Current Stock</h3>
        </div>
        {inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#555555]/50">
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Pieces</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Metres</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Min Stock</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b border-[#555555]/30 last:border-0 hover:bg-[#1A1A2E]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white capitalize">{item.saree_type} Saree</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${item.current_pieces <= item.minimum_stock && item.minimum_stock > 0 ? "text-[#E94560]" : "text-[#10B981]"}`}>
                        {item.current_pieces}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white/80">{item.current_metres}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white/50">{item.minimum_stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white/50">
                        {new Date(item.last_updated).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-10 h-10 text-white/30 mb-3" />
            <p className="text-white/50">No inventory items yet</p>
          </div>
        )}
      </div>

      {/* Recent Movements */}
      <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
        <div className="p-4 border-b border-[#555555]/50">
          <h3 className="text-lg font-semibold text-white">Recent Movements</h3>
        </div>
        {movements.length > 0 ? (
          <div className="divide-y divide-[#555555]/30">
            {movements.slice(0, 10).map((mov) => {
              const isIn = ["stock_in", "return_in"].includes(mov.movement_type)
              return (
                <div key={mov.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isIn ? "bg-[#10B981]/20" : "bg-[#E94560]/20"}`}>
                      {isIn ? <ArrowDownRight className="w-4 h-4 text-[#10B981]" /> : <ArrowUpRight className="w-4 h-4 text-[#E94560]" />}
                    </div>
                    <div>
                      <p className="text-sm text-white capitalize">{mov.movement_type.replace("_", " ")}</p>
                      <p className="text-xs text-white/50">{new Date(mov.movement_date).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isIn ? "text-[#10B981]" : "text-[#E94560]"}`}>
                      {isIn ? "+" : "-"}{mov.pieces} pcs
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-white/50 text-sm">No movements recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
