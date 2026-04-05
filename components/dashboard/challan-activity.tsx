"use client"

import { cn } from "@/lib/utils"

const challans = [
  {
    challanNo: "CH-2024-089",
    workerName: "Mohan Patel",
    design: "DSN-4521",
    pieces: 25,
    sentDate: "06 Mar 2024",
    status: "Sent",
    daysOut: 3,
  },
  {
    challanNo: "CH-2024-088",
    workerName: "Ramesh Kumar",
    design: "DSN-4518",
    pieces: 40,
    sentDate: "02 Mar 2024",
    status: "Sent",
    daysOut: 7,
  },
  {
    challanNo: "CH-2024-085",
    workerName: "Suresh Sharma",
    design: "DSN-4512",
    pieces: 30,
    sentDate: "25 Feb 2024",
    status: "Received",
    daysOut: 12,
  },
  {
    challanNo: "CH-2024-082",
    workerName: "Amit Singh",
    design: "DSN-4508",
    pieces: 50,
    sentDate: "20 Feb 2024",
    status: "Overdue",
    daysOut: 17,
  },
  {
    challanNo: "CH-2024-080",
    workerName: "Vijay Gupta",
    design: "DSN-4502",
    pieces: 35,
    sentDate: "18 Feb 2024",
    status: "Received",
    daysOut: 10,
  },
]

const statusStyles: Record<string, { bg: string; text: string }> = {
  Sent: { bg: "bg-[#FFD700]/20", text: "text-[#FFD700]" },
  Received: { bg: "bg-[#10B981]/20", text: "text-[#10B981]" },
  Overdue: { bg: "bg-[#E94560]/20", text: "text-[#E94560]" },
}

function getDaysColor(days: number): string {
  if (days <= 7) return "text-[#10B981]"
  if (days <= 14) return "text-[#FFD700]"
  return "text-[#E94560]"
}

export function ChallanActivity() {
  return (
    <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50">
      <div className="p-4 border-b border-[#555555]/50">
        <h2 className="text-lg font-semibold text-white">Challan Activity</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#555555]/50">
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Challan No</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Worker Name</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden sm:table-cell">Design</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden md:table-cell">Pieces</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden lg:table-cell">Sent Date</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Days Out</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((challan) => (
              <tr
                key={challan.challanNo}
                className="border-b border-[#555555]/30 last:border-0 hover:bg-[#1A1A2E]/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#00BCD4]">{challan.challanNo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{challan.workerName}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-white/80">{challan.design}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-white/80">{challan.pieces}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-white/60">{challan.sentDate}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-sm font-medium", getDaysColor(challan.daysOut))}>
                    {challan.daysOut} days
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                      statusStyles[challan.status]?.bg,
                      statusStyles[challan.status]?.text
                    )}
                  >
                    {challan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
