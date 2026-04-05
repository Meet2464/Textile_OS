"use client"

const stages = [
  { name: "Jecard", pieces: 45, percentage: 85, color: "#FFD700" },
  { name: "Butta Cutting", pieces: 38, percentage: 72, color: "#3B82F6" },
  { name: "Bleach", pieces: 22, percentage: 55, color: "#00BCD4" },
  { name: "Cotting", pieces: 30, percentage: 60, color: "#8B5CF6" },
  { name: "Position Print", pieces: 18, percentage: 40, color: "#FF6B35" },
  { name: "Checking", pieces: 12, percentage: 25, color: "#E94560" },
  { name: "Delivery", pieces: 89, percentage: 100, color: "#10B981" },
]

export function ProductionPipeline() {
  return (
    <div className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50">
      <div className="p-4 border-b border-[#555555]/50">
        <h2 className="text-lg font-semibold text-white">Production Pipeline</h2>
      </div>
      <div className="p-4 space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.name} className="relative">
            <div className="flex items-center gap-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: `${stage.color}20`,
                    color: stage.color,
                    border: `2px solid ${stage.color}`,
                  }}
                >
                  {index + 1}
                </div>
                {index < stages.length - 1 && (
                  <div className="w-0.5 h-8 bg-[#555555]" />
                )}
              </div>

              {/* Stage info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">{stage.pieces} pcs</span>
                    <span
                      className="text-xs font-medium"
                      style={{ color: stage.color }}
                    >
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
