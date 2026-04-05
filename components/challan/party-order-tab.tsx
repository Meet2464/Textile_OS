"use client"

import { useState } from "react"
import { Send, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const pendingOrders = [
  { poNo: "PO-2024-001", partyName: "Shree Krishna Textiles", designNo: "DSN-4521", qty: 50, date: "08 Mar 2024" },
  { poNo: "PO-2024-001", partyName: "Shree Krishna Textiles", designNo: "DSN-4520", qty: 30, date: "08 Mar 2024" },
  { poNo: "PO-2024-002", partyName: "Radha Sarees Pvt Ltd", designNo: "DSN-4518", qty: 40, date: "07 Mar 2024" },
  { poNo: "PO-2024-002", partyName: "Radha Sarees Pvt Ltd", designNo: "DSN-4517", qty: 35, date: "07 Mar 2024" },
  { poNo: "PO-2024-005", partyName: "Anand Textiles", designNo: "DSN-4512", qty: 80, date: "04 Mar 2024" },
]

const workers = [
  { id: 1, name: "Mohan Patel" },
  { id: 2, name: "Ramesh Kumar" },
  { id: 3, name: "Suresh Sharma" },
  { id: 4, name: "Amit Singh" },
  { id: 5, name: "Vijay Gupta" },
]

interface SendDrawerProps {
  open: boolean
  onClose: () => void
  order: typeof pendingOrders[0] | null
}

function SendDrawer({ open, onClose, order }: SendDrawerProps) {
  const [sareeType, setSareeType] = useState<"color" | "white" | "garments">("color")
  const [withBlouse, setWithBlouse] = useState(true)
  const [pieces, setPieces] = useState("")
  const [worker, setWorker] = useState("")

  const metres = pieces ? (parseInt(pieces) * 5.5).toFixed(1) : "0"

  if (!open || !order) return null

  const DrawerContent = () => (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      {/* Order Preview */}
      <div className="bg-[#2A2A2A] rounded-lg p-4 border border-[#555555]/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50">Order</p>
            <p className="text-sm font-medium text-[#FF6B35]">{order.poNo}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Design</p>
            <p className="text-sm font-medium text-[#FFD700]">{order.designNo}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Qty</p>
            <p className="text-sm font-medium text-white">{order.qty}</p>
          </div>
        </div>
        <p className="text-sm text-white mt-3">{order.partyName}</p>
      </div>

      {/* Saree Type */}
      <div className="mt-6 space-y-2">
        <label className="text-sm font-medium text-white/80">Saree Type</label>
        <div className="flex gap-2">
          {[
            { value: "color", label: "Color Saree" },
            { value: "white", label: "White Saree" },
            { value: "garments", label: "Garments" },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSareeType(type.value as typeof sareeType)}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                sareeType === type.value
                  ? "bg-[#FFD700] text-[#1A1A2E]"
                  : "bg-[#2A2A2A] text-white/70 hover:text-white border border-[#555555]"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* With/Without Blouse */}
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-white/80">Blouse</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWithBlouse(true)}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              withBlouse
                ? "bg-[#10B981] text-white"
                : "bg-[#2A2A2A] text-white/70 border border-[#555555]"
            )}
          >
            With Blouse
          </button>
          <button
            type="button"
            onClick={() => setWithBlouse(false)}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              !withBlouse
                ? "bg-[#555555] text-white"
                : "bg-[#2A2A2A] text-white/70 border border-[#555555]"
            )}
          >
            Without Blouse
          </button>
        </div>
      </div>

      {/* Pieces */}
      <div className="mt-4 space-y-2">
        <label htmlFor="pieces" className="text-sm font-medium text-white/80">
          Pieces
        </label>
        <input
          id="pieces"
          type="number"
          placeholder="Enter pieces"
          value={pieces}
          onChange={(e) => setPieces(e.target.value)}
          className="w-full h-12 px-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
        />
        <p className="text-sm text-white/50">Metres: {metres} mtr</p>
      </div>

      {/* Worker */}
      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium text-white/80">Worker</label>
        <div className="relative">
          <select
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 appearance-none cursor-pointer"
          >
            <option value="">Select karigar</option>
            {workers.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 rounded-lg bg-[#FFD700] text-[#1A1A2E] font-semibold hover:bg-[#FFD700]/90 transition-colors"
        >
          Send to Jecard
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Drawer */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:block hidden" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1A1A2E] border-l border-[#555555] z-50 hidden lg:flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#555555]">
          <h2 className="text-xl font-semibold text-white">Send Challan</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70">
            <X className="w-5 h-5" />
          </button>
        </div>
        <DrawerContent />
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A2E] rounded-t-3xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="flex items-center justify-between px-6 pb-4">
            <h2 className="text-xl font-semibold text-white">Send Challan</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70">
              <X className="w-5 h-5" />
            </button>
          </div>
          <DrawerContent />
        </div>
      </div>
    </>
  )
}

export function PartyOrderTab() {
  const [selectedOrder, setSelectedOrder] = useState<typeof pendingOrders[0] | null>(null)

  return (
    <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#555555]/50">
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">P.O.No</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Party Name</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden sm:table-cell">Design No</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden md:table-cell">Qty</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order, index) => (
              <tr
                key={`${order.poNo}-${order.designNo}-${index}`}
                className="border-b border-[#555555]/30 last:border-0 hover:bg-[#1A1A2E]/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#FF6B35]">{order.poNo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{order.partyName}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm font-medium text-[#FFD700]">{order.designNo}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-white/80">{order.qty}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-white/60">{order.date}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD700] text-[#1A1A2E] text-sm font-medium hover:bg-[#FFD700]/90 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SendDrawer
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  )
}
