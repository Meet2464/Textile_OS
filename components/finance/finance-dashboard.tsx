"use client"

import { IndianRupee, TrendingUp, TrendingDown, CreditCard } from "lucide-react"
import { useOrderPayments, useWorkerPayments } from "@/hooks/use-payments"

export function FinanceDashboard() {
  const { payments: orderPayments, transactions, loading: loadingOrders, totalReceivable } = useOrderPayments()
  const { payments: workerPayments, loading: loadingWorkers, totalPayable } = useWorkerPayments()

  const loading = loadingOrders || loadingWorkers
  const netPosition = totalReceivable - totalPayable

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Receivable from Parties</p>
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
          </div>
          <p className="text-3xl font-bold text-[#10B981] mt-3">
            <IndianRupee className="w-6 h-6 inline" />
            {totalReceivable.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-white/50 mt-2">Total outstanding amount</p>
        </div>

        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Payable to Workers</p>
            <TrendingDown className="w-5 h-5 text-[#E94560]" />
          </div>
          <p className="text-3xl font-bold text-[#E94560] mt-3">
            <IndianRupee className="w-6 h-6 inline" />
            {totalPayable.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-white/50 mt-2">Total due to karigars</p>
        </div>

        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Net Position</p>
            <TrendingUp className="w-5 h-5 text-[#FFD700]" />
          </div>
          <p className="text-3xl font-bold text-[#FFD700] mt-3">
            <IndianRupee className="w-6 h-6 inline" />
            {netPosition.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-white/50 mt-2">Receivable - Payable</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Party Payments */}
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
          <div className="p-4 border-b border-[#555555]/50">
            <h3 className="text-lg font-semibold text-white">Order Payments</h3>
          </div>
          {orderPayments.length > 0 ? (
            <div className="divide-y divide-[#555555]/30">
              {orderPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{p.party_name || "—"}</p>
                    <p className="text-xs text-white/50 capitalize">{p.payment_status.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#FFD700]">
                      <IndianRupee className="w-3 h-3 inline" />{p.balance_due.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-white/40">due</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CreditCard className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-sm text-white/40">No order payments yet</p>
            </div>
          )}
        </div>

        {/* Worker Payments */}
        <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
          <div className="p-4 border-b border-[#555555]/50">
            <h3 className="text-lg font-semibold text-white">Worker Payments</h3>
          </div>
          {workerPayments.length > 0 ? (
            <div className="divide-y divide-[#555555]/30">
              {workerPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{p.pieces_completed} pieces</p>
                    <p className="text-xs text-white/50 capitalize">{p.payment_status}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${p.payment_status === "paid" ? "text-[#10B981]" : "text-[#E94560]"}`}>
                      <IndianRupee className="w-3 h-3 inline" />{p.total_amount.toLocaleString("en-IN")}
                    </p>
                    {p.paid_date && (
                      <p className="text-xs text-white/40">
                        {new Date(p.paid_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CreditCard className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-sm text-white/40">No worker payments yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden">
        <div className="p-4 border-b border-[#555555]/50">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </div>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#555555]/50">
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-white/60 px-4 py-3 hidden sm:table-cell">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((txn) => (
                  <tr key={txn.id} className="border-b border-[#555555]/30 last:border-0 hover:bg-[#1A1A2E]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm text-white/80">
                        {new Date(txn.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-[#10B981]">
                        <IndianRupee className="w-3 h-3 inline" />{txn.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white/60 capitalize">{txn.payment_method}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-white/50">{txn.reference_number || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-white/40">No transactions recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
