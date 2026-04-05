"use client"

import Link from "next/link"
import { ArrowLeft, Bell, Package, Truck, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: 1,
    type: "challan",
    title: "Challan Overdue",
    message: "CH-2024-082 from Amit Singh is 17 days overdue",
    time: "2 hours ago",
    read: false,
    icon: AlertCircle,
    color: "#E94560",
  },
  {
    id: 2,
    type: "order",
    title: "New Order Received",
    message: "PO-2024-006 from Lakshmi Silks - 8 designs",
    time: "5 hours ago",
    read: false,
    icon: Package,
    color: "#FF6B35",
  },
  {
    id: 3,
    type: "production",
    title: "Production Complete",
    message: "DSN-4515 moved to Checking stage",
    time: "Yesterday",
    read: true,
    icon: CheckCircle,
    color: "#10B981",
  },
  {
    id: 4,
    type: "challan",
    title: "Challan Returned",
    message: "CH-2024-080 received from Vijay Gupta",
    time: "Yesterday",
    read: true,
    icon: Truck,
    color: "#00BCD4",
  },
  {
    id: 5,
    type: "order",
    title: "Order Delivered",
    message: "PO-2024-003 delivered to Ganesh Fabrics",
    time: "2 days ago",
    read: true,
    icon: CheckCircle,
    color: "#10B981",
  },
]

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b border-[#555555]/50">
        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Notifications</h1>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-[#E94560] text-white text-xs font-medium">
          2 new
        </span>
      </header>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "bg-[#2A2A2A] rounded-xl p-4 border transition-all",
              notification.read
                ? "border-[#555555]/30"
                : "border-[#555555]/50 bg-[#2A2A2A]/80"
            )}
          >
            <div className="flex gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${notification.color}20` }}
              >
                <notification.icon
                  className="w-5 h-5"
                  style={{ color: notification.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-white">{notification.title}</h3>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-[#FFD700] flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-white/60 mt-0.5 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-white/40 mt-2">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
