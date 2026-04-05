"use client"

import { useState } from "react"
import { ArrowRight, Package } from "lucide-react"
import { useProductionStages } from "@/hooks/use-production"
import { cn } from "@/lib/utils"
import type { ProcessType } from "@/lib/types/database.types"

const stageColors: Record<string, string> = {
  jecard: "#FFD700",
  butta_cutting: "#3B82F6",
  bleach: "#00BCD4",
  cotting: "#8B5CF6",
  position_print: "#FF6B35",
  checking: "#E94560",
  delivery: "#10B981",
}

const stageNames: Record<string, string> = {
  jecard: "Jecard",
  butta_cutting: "Butta Cutting",
  bleach: "Bleach",
  cotting: "Cotting",
  position_print: "Position Print",
  checking: "Checking",
  delivery: "Delivery",
}

const stageOrder: ProcessType[] = ["jecard", "butta_cutting", "bleach", "cotting", "position_print", "checking", "delivery"]

export function ProductionKanban() {
  const { stagesByProcess, loading, moveToNextStage } = useProductionStages()

  const handleMove = async (stageId: string, currentProcess: ProcessType) => {
    const currentIdx = stageOrder.indexOf(currentProcess)
    if (currentIdx < stageOrder.length - 1) {
      await moveToNextStage(stageId, stageOrder[currentIdx + 1])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mobile View - Stacked */}
      <div className="lg:hidden space-y-4">
        {stageOrder.map((processType) => {
          const stages = stagesByProcess[processType] || []
          const color = stageColors[processType]
          return (
            <div
              key={processType}
              className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden"
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: `${color}15` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <h3 className="font-semibold text-white">{stageNames[processType]}</h3>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${color}30`, color }}
                >
                  {stages.length}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {stages.length === 0 ? (
                  <div className="py-8 text-center text-white/40 text-sm">
                    No orders in this stage
                  </div>
                ) : (
                  stages.map((stage) => (
                    <div
                      key={stage.id}
                      className="bg-[#1A1A2E] rounded-lg p-3 border border-[#555555]/30"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#FF6B35]">
                            {stage.saree_type === "color" ? "Color" : stage.saree_type === "white" ? "White" : "Garment"}
                          </p>
                          <p className="text-xs text-white/60 mt-0.5">{stage.status}</p>
                        </div>
                        {processType !== "delivery" && (
                          <button
                            onClick={() => handleMove(stage.id, processType)}
                            className="p-1.5 rounded-lg bg-[#2A2A2A] hover:bg-[#555555]/50 text-white/60 hover:text-white transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-white/50">{stage.pieces_in} pcs in</span>
                        <span className="text-xs text-white/50">{stage.pieces_out} pcs out</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop View - Kanban Board */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stageOrder.map((processType) => {
            const stages = stagesByProcess[processType] || []
            const color = stageColors[processType]
            return (
              <div
                key={processType}
                className="w-72 flex-shrink-0 bg-[#2A2A2A] rounded-xl border border-[#555555]/50 flex flex-col max-h-[calc(100vh-220px)]"
              >
                <div
                  className="px-4 py-3 flex items-center justify-between rounded-t-xl"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <h3 className="font-semibold text-white">{stageNames[processType]}</h3>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${color}30`, color }}
                  >
                    {stages.length}
                  </span>
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {stages.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package className="w-10 h-10 mx-auto text-white/20 mb-2" />
                      <p className="text-white/40 text-sm">No orders</p>
                    </div>
                  ) : (
                    stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="bg-[#1A1A2E] rounded-lg p-3 border border-[#555555]/30 hover:border-[#555555] transition-all hover:shadow-lg hover:shadow-black/20 group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-[#FF6B35]">
                              {stage.saree_type === "color" ? "Color Saree" : stage.saree_type === "white" ? "White Saree" : "Garment"}
                            </p>
                            <p className="text-xs text-white/60 mt-0.5 capitalize">{stage.status.replace("_", " ")}</p>
                          </div>
                          {processType !== "delivery" && (
                            <button
                              onClick={() => handleMove(stage.id, processType)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-[#2A2A2A] hover:bg-[#555555]/50 text-white/60 hover:text-white transition-all"
                              title="Move to next stage"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#555555]/30">
                          <span className="text-sm text-white/50">{stage.pieces_in} pcs</span>
                          {stage.notes && (
                            <span className="text-xs text-white/40 ml-auto truncate max-w-[120px]">{stage.notes}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
