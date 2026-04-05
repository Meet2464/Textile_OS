"use client"

import { useState } from "react"
import { Plus, Cpu, Wrench, X, AlertCircle } from "lucide-react"
import { useMachines } from "@/hooks/use-machines"
import { cn } from "@/lib/utils"
import type { MachineType, MachineStatus } from "@/lib/types/database.types"

const typeColors: Record<string, string> = {
  jecard: "#FFD700",
  butta_cutting: "#3B82F6",
  bleach: "#00BCD4",
  cotting: "#8B5CF6",
  position_print: "#FF6B35",
  checking: "#E94560",
}

const typeLabels: Record<string, string> = {
  jecard: "Jecard",
  butta_cutting: "Butta Cutting",
  bleach: "Bleach",
  cotting: "Cotting",
  position_print: "Position Print",
  checking: "Checking",
}

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: "#10B981", label: "Active" },
  idle: { color: "#FFD700", label: "Idle" },
  maintenance: { color: "#E94560", label: "Maintenance" },
}

export function MachinesGrid() {
  const { machines, loading, addMachine, deleteMachine } = useMachines()
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    machine_name: "",
    machine_type: "jecard" as MachineType,
    machine_code: "",
    status: "active" as MachineStatus,
  })
  const [error, setError] = useState("")

  const handleAdd = async () => {
    if (!formData.machine_name.trim() || !formData.machine_code.trim()) {
      setError("Name and code are required")
      return
    }
    const result = await addMachine({
      machine_name: formData.machine_name.trim(),
      machine_type: formData.machine_type,
      machine_code: formData.machine_code.trim().toUpperCase(),
      status: formData.status,
      last_maintenance_date: null,
      next_maintenance_date: null,
    })
    if (result) {
      setIsAdding(false)
      setFormData({ machine_name: "", machine_type: "jecard", machine_code: "", status: "active" })
      setError("")
    } else {
      setError("Failed to add machine. Code may already exist.")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this machine?")) {
      await deleteMachine(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD700] text-[#1A1A2E] font-medium text-sm hover:bg-[#FFD700]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Machine
        </button>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-[#1A1A2E] rounded-2xl border border-[#555555] w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Add Machine</h3>
              <button onClick={() => { setIsAdding(false); setError("") }} className="p-1.5 rounded-lg hover:bg-[#2A2A2A] text-white/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-[#E94560]">
                <AlertCircle className="w-4 h-4" />{error}
              </p>
            )}
            <input
              placeholder="Machine Name"
              value={formData.machine_name}
              onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
              className="w-full h-12 px-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
            />
            <input
              placeholder="Machine Code (e.g. JC-001)"
              value={formData.machine_code}
              onChange={(e) => setFormData({ ...formData, machine_code: e.target.value.toUpperCase() })}
              className="w-full h-12 px-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 uppercase"
            />
            <select
              value={formData.machine_type}
              onChange={(e) => setFormData({ ...formData, machine_type: e.target.value as MachineType })}
              className="w-full h-12 px-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white text-sm focus:outline-none"
            >
              {Object.entries(typeLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="w-full h-12 rounded-lg bg-[#FFD700] text-[#1A1A2E] font-semibold hover:bg-[#FFD700]/90 transition-colors"
            >
              Add Machine
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => {
            const color = typeColors[machine.machine_type] || "#FFD700"
            const status = statusConfig[machine.status]
            return (
              <div key={machine.id} className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-5 hover:border-[#555555] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      <Cpu className="w-6 h-6" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{machine.machine_name}</h3>
                      <p className="text-xs text-white/50">{machine.machine_code}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${color}20`, color }}>
                    {typeLabels[machine.machine_type]}
                  </span>
                  {machine.next_maintenance_date && (
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Wrench className="w-3.5 h-3.5" />
                      {new Date(machine.next_maintenance_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && machines.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4">
            <Cpu className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-lg font-medium text-white">No machines yet</h3>
          <p className="text-sm text-white/50 mt-1">Add your first machine to start tracking</p>
        </div>
      )}
    </div>
  )
}
