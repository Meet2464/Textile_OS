"use client"

import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

const challanOptions = [
  {
    name: "Color Saree",
    description: "Send color saree orders to production",
    href: "/mobile/challan/color-saree",
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <path
          d="M10 10 Q20 5 30 10 L30 35 Q20 30 10 35 Z"
          fill="#FFD700"
          stroke="#FFD700"
          strokeWidth="2"
        />
        <path d="M10 10 Q15 15 10 20 Q15 25 10 30" fill="none" stroke="#1A1A2E" strokeWidth="1" />
      </svg>
    ),
    color: "#FFD700",
    available: true,
  },
  {
    name: "White Saree",
    description: "Send white saree orders to production",
    href: "/mobile/challan/white-saree",
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <path
          d="M10 10 Q20 5 30 10 L30 35 Q20 30 10 35 Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path d="M10 10 Q15 15 10 20 Q15 25 10 30" fill="none" stroke="#555555" strokeWidth="1" />
      </svg>
    ),
    color: "#FFFFFF",
    available: true,
  },
  {
    name: "Garments",
    description: "Coming soon",
    href: "#",
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10 opacity-50">
        <path
          d="M15 8 L25 8 L28 15 L35 15 L30 25 L30 35 L10 35 L10 25 L5 15 L12 15 Z"
          fill="#555555"
          stroke="#555555"
          strokeWidth="2"
        />
      </svg>
    ),
    color: "#555555",
    available: false,
  },
]

export default function MobileChallanPage() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b border-[#555555]/50">
        <Link
          href="/mobile"
          className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Challan</h1>
      </header>

      {/* Options */}
      <main className="flex-1 p-4 space-y-3">
        {challanOptions.map((option) => (
          <Link
            key={option.name}
            href={option.href}
            className={`block bg-[#2A2A2A] rounded-2xl p-4 border transition-all ${
              option.available
                ? "border-[#555555]/50 hover:border-[#555555] active:scale-[0.98]"
                : "border-[#555555]/30 opacity-60 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${option.color}15` }}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{option.name}</h3>
                  {!option.available && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#555555] text-white/60">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50 mt-0.5">{option.description}</p>
              </div>
              {option.available && (
                <ChevronRight className="w-5 h-5 text-white/40" />
              )}
            </div>
          </Link>
        ))}

        {/* Party Order Button */}
        <div className="pt-4 space-y-3">
          <Link
            href="/challan"
            className="block w-full bg-[#FFD700] text-[#1A1A2E] font-semibold text-center py-4 rounded-xl hover:bg-[#FFD700]/90 transition-colors active:scale-[0.98]"
          >
            Party Order
          </Link>
          <Link
            href="/challan"
            className="block w-full bg-[#10B981] text-white font-semibold text-center py-4 rounded-xl hover:bg-[#10B981]/90 transition-colors active:scale-[0.98]"
          >
            Receiving Challan
          </Link>
        </div>
      </main>
    </div>
  )
}
