"use client"

import { useState } from "react"
import { X, Plus, Trash2, AlertCircle, Calendar } from "lucide-react"
import { useOrders } from "@/hooks/use-orders"
import { cn } from "@/lib/utils"

interface DesignLine {
  id: number
  designNo: string
  quantity: string
  error?: string
}

interface AddOrderDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddOrderDrawer({ open, onOpenChange }: AddOrderDrawerProps) {
  const { addOrder } = useOrders()
  const [partyName, setPartyName] = useState("")
  const [poDate, setPoDate] = useState("")
  const [designLines, setDesignLines] = useState<DesignLine[]>([
    { id: 1, designNo: "", quantity: "" },
  ])
  const [submitting, setSubmitting] = useState(false)

  const addDesignLine = () => {
    setDesignLines([
      ...designLines,
      { id: Date.now(), designNo: "", quantity: "" },
    ])
  }

  const removeDesignLine = (id: number) => {
    if (designLines.length > 1) {
      setDesignLines(designLines.filter((line) => line.id !== id))
    }
  }

  const updateDesignLine = (id: number, field: "designNo" | "quantity", value: string) => {
    setDesignLines(
      designLines.map((line) =>
        line.id === id ? { ...line, [field]: value, error: undefined } : line
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partyName.trim()) return

    const validLines = designLines.filter((l) => l.designNo.trim() && l.quantity)
    if (validLines.length === 0) return

    setSubmitting(true)
    const totalQty = validLines.reduce((sum, l) => sum + parseInt(l.quantity || "0"), 0)

    const result = await addOrder(
      {
        party_name: partyName.trim(),
        order_date: poDate || new Date().toISOString().split("T")[0],
        status: "pending",
        total_quantity: totalQty,
        notes: null,
      },
      validLines.map((line) => ({
        design_id: null,
        design_number: line.designNo.trim(),
        quantity: parseInt(line.quantity),
        line_number: 0,
        status: "pending",
      }))
    )

    if (result) {
      onOpenChange(false)
      setPartyName("")
      setPoDate("")
      setDesignLines([{ id: 1, designNo: "", quantity: "" }])
    }
    setSubmitting(false)
  }

  const DrawerContent = () => (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto">
      {/* Party Name */}
      <div className="space-y-2">
        <label htmlFor="partyName" className="text-sm font-medium text-white/80">
          Party Name
        </label>
        <input
          id="partyName"
          type="text"
          placeholder="Enter party name"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          className="w-full h-12 px-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
        />
      </div>

      {/* P.O. Date */}
      <div className="space-y-2 mt-4">
        <label htmlFor="poDate" className="text-sm font-medium text-white/80">
          P.O. Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            id="poDate"
            type="date"
            value={poDate}
            onChange={(e) => setPoDate(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Design Lines */}
      <div className="space-y-3 mt-6">
        <label className="text-sm font-medium text-white/80">Design Lines</label>
        {designLines.map((line) => (
          <div key={line.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Design No"
                  value={line.designNo}
                  onChange={(e) => updateDesignLine(line.id, "designNo", e.target.value)}
                  className={cn(
                    "w-full h-11 px-4 rounded-lg bg-[#2A2A2A] border text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 transition-all",
                    line.error
                      ? "border-[#E94560] focus:ring-[#E94560]/50"
                      : "border-[#555555] focus:ring-[#FFD700]/50"
                  )}
                />
              </div>
              <input
                type="number"
                placeholder="Qty"
                value={line.quantity}
                onChange={(e) => updateDesignLine(line.id, "quantity", e.target.value)}
                className="w-24 h-11 px-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
              />
              {designLines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDesignLine(line.id)}
                  className="p-2.5 rounded-lg bg-[#E94560]/20 text-[#E94560] hover:bg-[#E94560]/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {line.error && (
              <p className="flex items-center gap-1.5 text-sm text-[#E94560]">
                <AlertCircle className="w-4 h-4" />
                {line.error}
              </p>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addDesignLine}
          className="flex items-center gap-2 text-sm text-[#FFD700] hover:text-[#FFD700]/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Design
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-auto pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-lg bg-[#FF6B35] text-white font-semibold hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Create Order"
          )}
        </button>
      </div>
    </form>
  )

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:block hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Desktop Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-[#1A1A2E] border-l border-[#555555] z-50 transform transition-transform duration-300 hidden lg:flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#555555]">
          <h2 className="text-xl font-semibold text-white">New Order</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <DrawerContent />
      </div>

      {/* Mobile Bottom Sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A2E] rounded-t-3xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-xl font-semibold text-white">New Order</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DrawerContent />
          </div>
        </div>
      )}
    </>
  )
}
