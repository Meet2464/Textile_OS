"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"

const pendingData = [
  { poNo: "PO-001", dNo: "DSN-4521", piece: 25, mtr: 137.5 },
  { poNo: "PO-001", dNo: "DSN-4520", piece: 30, mtr: 165.0 },
  { poNo: "PO-002", dNo: "DSN-4518", piece: 40, mtr: 220.0 },
  { poNo: "PO-002", dNo: "DSN-4517", piece: 35, mtr: 192.5 },
  { poNo: "PO-005", dNo: "DSN-4512", piece: 80, mtr: 440.0 },
]

const doneData = [
  { poNo: "PO-003", dNo: "DSN-4515", piece: 45, mtr: 247.5 },
  { poNo: "PO-003", dNo: "DSN-4514", piece: 55, mtr: 302.5 },
  { poNo: "PO-003", dNo: "DSN-4516", piece: 60, mtr: 330.0 },
]

interface SendSheetProps {
  open: boolean
  onClose: () => void
  order: typeof pendingData[0] | null
}

function SendSheet({ open, onClose, order }: SendSheetProps) {
  const [clientName, setClientName] = useState("")
  const [pieces, setPieces] = useState(order?.piece.toString() || "")

  if (!open || !order) return null

  const metres = pieces ? (parseInt(pieces) * 5.5).toFixed(1) : "0"
  const challanNo = `CH-2024-${Math.floor(Math.random() * 900) + 100}`

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A2E] rounded-t-3xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h2 className="text-xl font-semibold text-white">Send to Jecard</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 space-y-4 overflow-y-auto">
          {/* Order Preview */}
          <div className="bg-[#2A2A2A] rounded-xl p-4 border border-[#555555]/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Order</p>
                <p className="text-sm font-medium text-[#FF6B35]">{order.poNo}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Design</p>
                <p className="text-sm font-medium text-[#FFD700]">{order.dNo}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Qty</p>
                <p className="text-sm font-medium text-white">{order.piece}</p>
              </div>
            </div>
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Client Name</label>
            <input
              type="text"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
            />
          </div>

          {/* Challan No */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Challan No</label>
            <input
              type="text"
              value={challanNo}
              readOnly
              className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white/60 text-sm"
            />
          </div>

          {/* Pieces */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Piece</label>
            <input
              type="number"
              placeholder="Enter pieces"
              value={pieces}
              onChange={(e) => setPieces(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
            />
            <p className="text-sm text-white/50 px-1">Mtr: {metres}</p>
          </div>

          {/* Submit */}
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-[#FFD700] text-[#1A1A2E] font-semibold active:scale-[0.98] transition-transform"
          >
            Send & Print
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ColorSareeJecardPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "done">("pending")
  const [selectedOrder, setSelectedOrder] = useState<typeof pendingData[0] | null>(null)

  const data = activeTab === "pending" ? pendingData : doneData

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b border-[#555555]/50">
        <Link
          href="/mobile/challan"
          className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Color Saree - Jecard</h1>
      </header>

      {/* Tabs */}
      <div className="px-4 py-3">
        <div className="flex p-1 bg-[#2A2A2A] rounded-lg">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex-1 py-2.5 rounded-md text-sm font-medium transition-all",
              activeTab === "pending"
                ? "bg-[#FFD700] text-[#1A1A2E]"
                : "text-white/70"
            )}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={cn(
              "flex-1 py-2.5 rounded-md text-sm font-medium transition-all",
              activeTab === "done"
                ? "bg-[#10B981] text-white"
                : "text-white/70"
            )}
          >
            Done
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-[#555555]/50">
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">P.O.No</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">D.No</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Piece</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Mtr</th>
              {activeTab === "pending" && (
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={`${item.poNo}-${item.dNo}-${index}`}
                className="border-b border-[#555555]/30"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#FF6B35]">{item.poNo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#FFD700]">{item.dNo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{item.piece}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white/70">{item.mtr}</span>
                </td>
                {activeTab === "pending" && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrder(item)}
                      className="text-sm font-medium text-[#10B981] hover:text-[#10B981]/80 transition-colors"
                    >
                      SEND
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Tabs */}
      <div className="px-4 py-4 border-t border-[#555555]/50">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === "pending"
                ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]"
                : "bg-[#2A2A2A] text-white/60 border border-[#555555]/50"
            )}
          >
            Pending data
          </button>
          <button
            onClick={() => setActiveTab("done")}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === "done"
                ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]"
                : "bg-[#2A2A2A] text-white/60 border border-[#555555]/50"
            )}
          >
            Done data
          </button>
        </div>
      </div>

      {/* Send Sheet */}
      <SendSheet
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  )
}
