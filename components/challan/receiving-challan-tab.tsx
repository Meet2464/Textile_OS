"use client"

import { useState } from "react"
import { Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const receivedHistory = [
  {
    challanNo: "CH-2024-082",
    workerName: "Amit Singh",
    design: "DSN-4508",
    pieces: 50,
    metres: 275,
    returnedDate: "08 Mar 2024",
    quality: "Good",
  },
  {
    challanNo: "CH-2024-080",
    workerName: "Vijay Gupta",
    design: "DSN-4502",
    returnedDate: "06 Mar 2024",
    pieces: 33,
    metres: 181.5,
    quality: "Partial",
    damaged: 2,
  },
  {
    challanNo: "CH-2024-078",
    workerName: "Mohan Patel",
    design: "DSN-4498",
    pieces: 45,
    metres: 247.5,
    returnedDate: "04 Mar 2024",
    quality: "Good",
  },
]

export function ReceivingChallanTab() {
  const [challanNo, setChallanNo] = useState("")
  const [workerName, setWorkerName] = useState("")
  const [designNo, setDesignNo] = useState("")
  const [piecesReturned, setPiecesReturned] = useState("")
  const [metresReturned, setMetresReturned] = useState("")
  const [qualityStatus, setQualityStatus] = useState<"good" | "damaged" | "partial">("good")
  const [damageCount, setDamageCount] = useState("")
  const [notes, setNotes] = useState("")

  // Auto-fill when challan number matches
  const handleChallanSearch = (value: string) => {
    setChallanNo(value)
    // Mock auto-fill
    if (value === "CH-2024-089") {
      setWorkerName("Mohan Patel")
      setDesignNo("DSN-4521")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Recording return:", {
      challanNo,
      workerName,
      designNo,
      piecesReturned,
      metresReturned,
      qualityStatus,
      damageCount,
      notes,
    })
    // Reset form
    setChallanNo("")
    setWorkerName("")
    setDesignNo("")
    setPiecesReturned("")
    setMetresReturned("")
    setQualityStatus("good")
    setDamageCount("")
    setNotes("")
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Record Return</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Challan No */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Challan No</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search challan number"
                value={challanNo}
                onChange={(e) => handleChallanSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#1A1A2E] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
              />
            </div>
          </div>

          {/* Auto-filled fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Worker Name</label>
              <input
                type="text"
                value={workerName}
                readOnly
                placeholder="Auto-filled"
                className="w-full h-11 px-4 rounded-lg bg-[#1A1A2E] border border-[#555555] text-white/60 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Design No</label>
              <input
                type="text"
                value={designNo}
                readOnly
                placeholder="Auto-filled"
                className="w-full h-11 px-4 rounded-lg bg-[#1A1A2E] border border-[#555555] text-white/60 text-sm"
              />
            </div>
          </div>

          {/* Pieces & Metres */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Pieces Returned</label>
              <input
                type="number"
                placeholder="Enter pieces"
                value={piecesReturned}
                onChange={(e) => setPiecesReturned(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-[#1A1A2E] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Metres Returned</label>
              <input
                type="number"
                placeholder="Enter metres"
                value={metresReturned}
                onChange={(e) => setMetresReturned(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-[#1A1A2E] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
              />
            </div>
          </div>

          {/* Quality Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Quality Status</label>
            <div className="flex gap-2">
              {[
                { value: "good", label: "Good", color: "#10B981" },
                { value: "damaged", label: "Damaged", color: "#E94560" },
                { value: "partial", label: "Partial", color: "#FFD700" },
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setQualityStatus(status.value as typeof qualityStatus)}
                  className={cn(
                    "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border",
                    qualityStatus === status.value
                      ? `bg-[${status.color}]/20 border-[${status.color}]`
                      : "bg-[#1A1A2E] border-[#555555] text-white/70"
                  )}
                  style={{
                    backgroundColor: qualityStatus === status.value ? `${status.color}20` : undefined,
                    borderColor: qualityStatus === status.value ? status.color : undefined,
                    color: qualityStatus === status.value ? status.color : undefined,
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Damage Count (conditional) */}
          {(qualityStatus === "damaged" || qualityStatus === "partial") && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Damage Count</label>
              <input
                type="number"
                placeholder="Number of damaged pieces"
                value={damageCount}
                onChange={(e) => setDamageCount(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-[#1A1A2E] border border-[#E94560]/50 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94560]/50 transition-all"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Notes</label>
            <textarea
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-[#1A1A2E] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-[#10B981] text-white font-semibold hover:bg-[#10B981]/90 transition-colors"
          >
            Record Return
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
        <div className="p-4 border-b border-[#555555]/50">
          <h3 className="text-lg font-semibold text-white">Received History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#555555]/50">
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Challan</th>
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Worker</th>
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden sm:table-cell">Pieces</th>
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Quality</th>
              </tr>
            </thead>
            <tbody>
              {receivedHistory.map((item) => (
                <tr
                  key={item.challanNo}
                  className="border-b border-[#555555]/30 last:border-0 hover:bg-[#1A1A2E]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#00BCD4]">{item.challanNo}</p>
                    <p className="text-xs text-white/50">{item.returnedDate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white">{item.workerName}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-white/80">{item.pieces}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                        item.quality === "Good" && "bg-[#10B981]/20 text-[#10B981]",
                        item.quality === "Partial" && "bg-[#FFD700]/20 text-[#FFD700]",
                        item.quality === "Damaged" && "bg-[#E94560]/20 text-[#E94560]"
                      )}
                    >
                      {item.quality}
                      {item.damaged && ` (${item.damaged})`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
