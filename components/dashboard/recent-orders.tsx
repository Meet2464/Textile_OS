"use client"

import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

const orders = [
  {
    poNo: "PO-2024-001",
    partyName: "Shree Krishna Textiles",
    date: "08 Mar 2024",
    designs: 5,
    status: "In Production",
  },
  {
    poNo: "PO-2024-002",
    partyName: "Radha Sarees Pvt Ltd",
    date: "07 Mar 2024",
    designs: 3,
    status: "Pending",
  },
  {
    poNo: "PO-2024-003",
    partyName: "Ganesh Fabrics",
    date: "06 Mar 2024",
    designs: 8,
    status: "Delivered",
  },
  {
    poNo: "PO-2024-004",
    partyName: "Lakshmi Silks",
    date: "05 Mar 2024",
    designs: 2,
    status: "In Production",
  },
  {
    poNo: "PO-2024-005",
    partyName: "Anand Textiles",
    date: "04 Mar 2024",
    designs: 6,
    status: "Pending",
  },
]

const statusStyles: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "bg-[#FF6B35]/20", text: "text-[#FF6B35]" },
  "In Production": { bg: "bg-[#3B82F6]/20", text: "text-[#3B82F6]" },
  Delivered: { bg: "bg-[#10B981]/20", text: "text-[#10B981]" },
}

export function RecentOrders() {
  return (
    <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50">
      <div className="p-4 border-b border-[#555555]/50">
        <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#555555]/50">
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">P.O.No</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Party Name</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden sm:table-cell">Date</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden md:table-cell">Designs</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Status</th>
              <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.poNo}
                className="border-b border-[#555555]/30 last:border-0 hover:bg-[#1A1A2E]/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#FFD700]">{order.poNo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-white">{order.partyName}</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-white/60">{order.date}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-white/80">{order.designs}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                      statusStyles[order.status]?.bg,
                      statusStyles[order.status]?.text
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-[#555555]/50 text-white/60 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
