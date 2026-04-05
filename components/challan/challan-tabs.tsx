"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { PartyOrderTab } from "./party-order-tab"
import { SendChallanTab } from "./send-challan-tab"
import { ReceivingChallanTab } from "./receiving-challan-tab"

const tabs = [
  { id: "party-order", label: "Party Order" },
  { id: "send-challan", label: "Send Challan" },
  { id: "receiving-challan", label: "Receiving Challan" },
]

export function ChallanTabs() {
  const [activeTab, setActiveTab] = useState("party-order")

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-[#2A2A2A] rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-[#FFD700] text-[#1A1A2E]"
                : "text-white/70 hover:text-white hover:bg-[#1A1A2E]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "party-order" && <PartyOrderTab />}
      {activeTab === "send-challan" && <SendChallanTab />}
      {activeTab === "receiving-challan" && <ReceivingChallanTab />}
    </div>
  )
}
