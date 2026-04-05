"use client"

import { useState } from "react"
import { Plus, Phone, Eye, X, FileText, IndianRupee } from "lucide-react"
import { useWorkers } from "@/hooks/use-workers"
import { cn } from "@/lib/utils"
import type { Worker } from "@/lib/types/database.types"

const specialtyColors: Record<string, string> = {
  jecard: "#FFD700",
  butta_cutting: "#3B82F6",
  bleach: "#00BCD4",
  cotting: "#8B5CF6",
  position_print: "#FF6B35",
  checking: "#E94560",
  delivery: "#10B981",
  multiple: "#9CA3AF",
}

const specialtyLabels: Record<string, string> = {
  jecard: "Jecard",
  butta_cutting: "Butta Cutting",
  bleach: "Bleach",
  cotting: "Cotting",
  position_print: "Position Print",
  checking: "Checking",
  delivery: "Delivery",
  multiple: "Multiple",
}

interface WorkerDrawerProps {
  open: boolean
  onClose: () => void
  worker: Worker | null
}

function WorkerDrawer({ open, onClose, worker }: WorkerDrawerProps) {
  if (!open || !worker) return null

  const color = specialtyColors[worker.specialty] || "#FFD700"
  const initials = worker.worker_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const DrawerContent = () => (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      {/* Worker Info */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-[#1A1A2E] text-xl font-bold"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{worker.worker_name}</h3>
          <span
            className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium mt-1"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {specialtyLabels[worker.specialty] || worker.specialty}
          </span>
        </div>
      </div>

      {/* Contact */}
      {worker.phone && (
        <div className="mt-6 flex items-center gap-3 bg-[#2A2A2A] rounded-lg p-4">
          <Phone className="w-5 h-5 text-white/50" />
          <span className="text-white">{worker.phone}</span>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-[#2A2A2A] rounded-lg p-4">
          <p className="text-xs text-white/50">Rate per Piece</p>
          <p className="text-xl font-bold text-[#FFD700] mt-1">
            <IndianRupee className="w-4 h-4 inline" />
            {worker.rate_per_piece}
          </p>
        </div>
        <div className="bg-[#2A2A2A] rounded-lg p-4">
          <p className="text-xs text-white/50">Specialty</p>
          <p className="text-xl font-bold mt-1" style={{ color }}>
            {specialtyLabels[worker.specialty] || worker.specialty}
          </p>
        </div>
      </div>

      {/* Address */}
      {worker.address && (
        <div className="mt-4 bg-[#2A2A2A] rounded-lg p-4">
          <p className="text-xs text-white/50 mb-1">Address</p>
          <p className="text-sm text-white">{worker.address}</p>
        </div>
      )}

      {/* Joined Date */}
      <div className="mt-4 bg-[#2A2A2A] rounded-lg p-4">
        <p className="text-xs text-white/50 mb-1">Added On</p>
        <p className="text-sm text-white">
          {new Date(worker.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Drawer */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:block hidden" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1A1A2E] border-l border-[#555555] z-50 hidden lg:flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#555555]">
          <h2 className="text-xl font-semibold text-white">Worker Details</h2>
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
            <h2 className="text-xl font-semibold text-white">Worker Details</h2>
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

export function WorkersGrid() {
  const { workers, loading, deleteWorker } = useWorkers()
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD700] text-[#1A1A2E] font-medium text-sm hover:bg-[#FFD700]/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Worker
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      )}

      {/* Workers Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => {
            const color = specialtyColors[worker.specialty] || "#FFD700"
            const initials = worker.worker_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={worker.id}
                className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-5 hover:border-[#555555] transition-all hover:shadow-xl hover:shadow-black/20"
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-[#1A1A2E] font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{worker.worker_name}</h3>
                    <span
                      className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium mt-1"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {specialtyLabels[worker.specialty] || worker.specialty}
                    </span>
                  </div>
                </div>

                {/* Contact */}
                {worker.phone && (
                  <div className="mt-4 flex items-center gap-2 text-white/60">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{worker.phone}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50">Rate/Piece</p>
                    <p className="text-sm font-medium text-[#FFD700]">
                      <IndianRupee className="w-3 h-3 inline" />
                      {worker.rate_per_piece}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => setSelectedWorker(worker)}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A1A2E] text-white/80 hover:text-white text-sm font-medium hover:bg-[#555555]/50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && workers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-lg font-medium text-white">No workers yet</h3>
          <p className="text-sm text-white/50 mt-1">Add your first karigar worker to get started</p>
        </div>
      )}

      <WorkerDrawer
        open={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
        worker={selectedWorker}
      />
    </div>
  )
}
