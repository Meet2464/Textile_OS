"use client"

import { useState } from "react"
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { AddDesignDrawer } from "./add-design-drawer"
import { useDesigns } from "@/hooks/use-designs"
import { cn } from "@/lib/utils"

export function DesignGrid() {
  const { designs, loading, deleteDesign } = useDesigns()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredDesigns = designs.filter((design) =>
    design.design_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this design?")) {
      await deleteDesign(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search by design number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
          />
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFD700] text-[#1A1A2E] font-medium text-sm hover:bg-[#FFD700]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Design
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      )}

      {/* Design Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDesigns.map((design) => (
            <div
              key={design.id}
              className="group bg-[#2A2A2A] rounded-xl border border-[#555555]/50 overflow-hidden hover:border-[#555555] hover:shadow-xl hover:shadow-black/20 transition-all hover:-translate-y-1"
            >
              {/* Image */}
              <div className="aspect-[3/4] bg-[#1A1A2E] flex items-center justify-center relative">
                {design.image_url ? (
                  <img
                    src={design.image_url}
                    alt={design.design_number}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#2A2A2A] flex items-center justify-center mb-3">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="w-8 h-8 text-white/30"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                    <p className="text-sm text-white/30">No Image</p>
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <Eye className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white">{design.design_number}</h3>
                <p className="text-sm text-white/50 mt-1">
                  {new Date(design.date_added).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1A1A2E] text-white/70 hover:text-white hover:bg-[#555555]/50 text-sm transition-colors">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="p-2 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6]/30 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(design.id)}
                    className="p-2 rounded-lg bg-[#E94560]/20 text-[#E94560] hover:bg-[#E94560]/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDesigns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-lg font-medium text-white">No designs found</h3>
          <p className="text-sm text-white/50 mt-1">
            {searchQuery ? "Try adjusting your search query" : "Add your first design to get started"}
          </p>
        </div>
      )}

      {/* Add Design Drawer */}
      <AddDesignDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </div>
  )
}
