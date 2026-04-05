"use client"

import { cn } from "@/lib/utils"

const activeChallans = [
  {
    challanNo: "CH-2024-089",
    workerName: "Mohan Patel",
    design: "DSN-4521",
    pieces: 25,
    metres: 137.5,
    daysSent: 3,
  },
  {
    challanNo: "CH-2024-088",
    workerName: "Ramesh Kumar",
    design: "DSN-4518",
    pieces: 40,
    metres: 220.0,
    daysSent: 7,
  },
  {
    challanNo: "CH-2024-087",
    workerName: "Suresh Sharma",
    design: "DSN-4520",
    pieces: 30,
    metres: 165.0,
    daysSent: 10,
  },
  {
    challanNo: "CH-2024-086",
    workerName: "Amit Singh",
    design: "DSN-4517",
    pieces: 35,
    metres: 192.5,
    daysSent: 14,
  },
  {
    challanNo: "CH-2024-085",
    workerName: "Vijay Gupta",
    design: "DSN-4512",
    pieces: 50,
    metres: 275.0,
    daysSent: 18,
  },
]

function getDaysColor(days: number): { bg: string; text: string; border: string } {
  if (days <= 7) return { bg: "bg-[#10B981]/10", text: "text-[#10B981]", border: "border-[#10B981]/30" }
  if (days <= 14) return { bg: "bg-[#FFD700]/10", text: "text-[#FFD700]", border: "border-[#FFD700]/30" }
  return { bg: "bg-[#E94560]/10", text: "text-[#E94560]", border: "border-[#E94560]/30" }
}

export function SendChallanTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activeChallans.map((challan) => {
        const daysStyle = getDaysColor(challan.daysSent)
        return (
          <div
            key={challan.challanNo}
            className={cn(
              "bg-[#2A2A2A] rounded-xl border p-5 transition-all hover:shadow-lg hover:shadow-black/20",
              daysStyle.border
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/50">Challan No</p>
                <p className="text-lg font-bold text-[#00BCD4]">{challan.challanNo}</p>
              </div>
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  daysStyle.bg,
                  daysStyle.text
                )}
              >
                {challan.daysSent} days
              </div>
            </div>

            {/* Worker */}
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-[#1A1A2E] font-semibold text-sm">
                {challan.workerName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{challan.workerName}</p>
                <p className="text-xs text-white/50">Karigar</p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-[#1A1A2E] rounded-lg p-3 text-center">
                <p className="text-xs text-white/50">Design</p>
                <p className="text-sm font-medium text-[#FFD700] mt-1">{challan.design}</p>
              </div>
              <div className="bg-[#1A1A2E] rounded-lg p-3 text-center">
                <p className="text-xs text-white/50">Pieces</p>
                <p className="text-sm font-medium text-white mt-1">{challan.pieces}</p>
              </div>
              <div className="bg-[#1A1A2E] rounded-lg p-3 text-center">
                <p className="text-xs text-white/50">Metres</p>
                <p className="text-sm font-medium text-white mt-1">{challan.metres}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
