"use client"

import { useState } from "react"
import { IndianRupee, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

const productionData = [
  { stage: "Jecard", pieces: 45, color: "#FFD700" },
  { stage: "Butta Cutting", pieces: 38, color: "#3B82F6" },
  { stage: "Bleach", pieces: 22, color: "#00BCD4" },
  { stage: "Cotting", pieces: 30, color: "#8B5CF6" },
  { stage: "Position Print", pieces: 18, color: "#FF6B35" },
  { stage: "Checking", pieces: 12, color: "#E94560" },
  { stage: "Delivery", pieces: 89, color: "#10B981" },
]

const orderStatusData = [
  { status: "Pending", count: 43, color: "#FF6B35", percentage: 28 },
  { status: "In Production", count: 67, color: "#3B82F6", percentage: 43 },
  { status: "Delivered", count: 38, color: "#10B981", percentage: 24 },
  { status: "Cancelled", count: 8, color: "#E94560", percentage: 5 },
]

const workerPerformance = [
  { name: "Mohan Patel", challans: 12, pieces: 245, avgDays: 5.2, paymentDue: 11025 },
  { name: "Ramesh Kumar", challans: 8, pieces: 180, avgDays: 6.8, paymentDue: 6300 },
  { name: "Suresh Sharma", challans: 15, pieces: 320, avgDays: 4.5, paymentDue: 9600 },
  { name: "Amit Singh", challans: 6, pieces: 156, avgDays: 8.1, paymentDue: 6240 },
  { name: "Vijay Gupta", challans: 10, pieces: 210, avgDays: 5.9, paymentDue: 10500 },
]

const monthlyData = [
  { month: "Oct", collections: 245000, payments: 180000 },
  { month: "Nov", collections: 312000, payments: 220000 },
  { month: "Dec", collections: 278000, payments: 195000 },
  { month: "Jan", collections: 356000, payments: 245000 },
  { month: "Feb", collections: 389000, payments: 268000 },
  { month: "Mar", collections: 245000, payments: 178000 },
]

const maxCollection = Math.max(...monthlyData.map((d) => d.collections))

export function ReportsDashboard() {
  const [dateRange, setDateRange] = useState("month")

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center gap-2 p-1 bg-[#2A2A2A] rounded-lg w-fit">
        {[
          { id: "week", label: "This Week" },
          { id: "month", label: "This Month" },
          { id: "custom", label: "Custom" },
        ].map((range) => (
          <button
            key={range.id}
            onClick={() => setDateRange(range.id)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              dateRange === range.id
                ? "bg-[#FFD700] text-[#1A1A2E]"
                : "text-white/70 hover:text-white hover:bg-[#1A1A2E]"
            )}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Production Overview & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Overview */}
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Production Overview</h3>
          <div className="space-y-4">
            {productionData.map((item) => (
              <div key={item.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{item.stage}</span>
                  <span style={{ color: item.color }}>{item.pieces} pcs</span>
                </div>
                <div className="h-3 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(item.pieces / 100) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Order Status</h3>
          <div className="flex items-center justify-center">
            {/* Donut Chart */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {orderStatusData.reduce(
                  (acc, item, index) => {
                    const strokeDasharray = `${item.percentage * 2.51327} ${251.327 - item.percentage * 2.51327}`
                    const strokeDashoffset = -acc.offset
                    acc.elements.push(
                      <circle
                        key={item.status}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700"
                      />
                    )
                    acc.offset += item.percentage * 2.51327
                    return acc
                  },
                  { elements: [] as JSX.Element[], offset: 0 }
                ).elements}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">156</span>
                <span className="text-sm text-white/60">Total Orders</span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {orderStatusData.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-white/70">{item.status}</span>
                <span className="text-sm font-medium text-white ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Worker Performance */}
      <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
        <div className="p-4 border-b border-[#555555]/50">
          <h3 className="text-lg font-semibold text-white">Worker Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#555555]/50">
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Worker Name</th>
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Challans</th>
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Pieces</th>
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden sm:table-cell">Avg Days</th>
                <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Payment Due</th>
              </tr>
            </thead>
            <tbody>
              {workerPerformance.map((worker) => (
                <tr
                  key={worker.name}
                  className="border-b border-[#555555]/30 last:border-0 hover:bg-[#1A1A2E]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">{worker.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white/80">{worker.challans}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#10B981] font-medium">{worker.pieces}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        worker.avgDays <= 6 ? "text-[#10B981]" : worker.avgDays <= 8 ? "text-[#FFD700]" : "text-[#E94560]"
                      )}
                    >
                      {worker.avgDays} days
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#FFD700]">
                      <IndianRupee className="w-3 h-3 inline" />
                      {worker.paymentDue.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receivable Card */}
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Receivable from Parties</p>
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-3xl font-bold text-[#10B981] mt-3">
            <IndianRupee className="w-6 h-6 inline" />
            4,85,000
          </p>
          <p className="text-xs text-white/50 mt-2">Total outstanding amount</p>
        </div>

        {/* Payable Card */}
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Payable to Workers</p>
            <TrendingDown className="w-5 h-5 text-[#E94560]" />
          </div>
          <p className="text-3xl font-bold text-[#E94560] mt-3">
            <IndianRupee className="w-6 h-6 inline" />
            1,23,665
          </p>
          <p className="text-xs text-white/50 mt-2">Total due to karigars</p>
        </div>

        {/* Net Position */}
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Net Position</p>
            <TrendingUp className="w-5 h-5 text-[#FFD700]" />
          </div>
          <p className="text-3xl font-bold text-[#FFD700] mt-3">
            <IndianRupee className="w-6 h-6 inline" />
            3,61,335
          </p>
          <p className="text-xs text-white/50 mt-2">Receivable - Payable</p>
        </div>
      </div>

      {/* Monthly Collections vs Payments Chart */}
      <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Monthly Collections vs Payments</h3>
        <div className="flex items-end gap-4 h-48">
          {monthlyData.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end justify-center h-40">
                {/* Collections Bar */}
                <div
                  className="w-5 rounded-t-sm bg-[#10B981] transition-all duration-500"
                  style={{ height: `${(item.collections / maxCollection) * 100}%` }}
                />
                {/* Payments Bar */}
                <div
                  className="w-5 rounded-t-sm bg-[#E94560] transition-all duration-500"
                  style={{ height: `${(item.payments / maxCollection) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white/60">{item.month}</span>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#10B981]" />
            <span className="text-sm text-white/70">Collections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#E94560]" />
            <span className="text-sm text-white/70">Payments</span>
          </div>
        </div>
      </div>
    </div>
  )
}
