"use client"

import Link from "next/link"
import { Layers, FileText, Truck, BarChart3, Home, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const quickActions = [
  {
    name: "Design No",
    href: "/designs",
    icon: Layers,
    color: "#8B5CF6",
    gradient: "from-[#8B5CF6] to-[#6366F1]",
  },
  {
    name: "Order No",
    href: "/orders",
    icon: FileText,
    color: "#FF6B35",
    gradient: "from-[#FF6B35] to-[#F97316]",
  },
  {
    name: "Challan",
    href: "/challan",
    icon: Truck,
    color: "#00BCD4",
    gradient: "from-[#00BCD4] to-[#06B6D4]",
  },
  {
    name: "Report",
    href: "/reports",
    icon: BarChart3,
    color: "#2A2A2A",
    gradient: "from-[#3A3A3A] to-[#2A2A2A]",
  },
]

const navItems = [
  { name: "Home", href: "/mobile", icon: Home },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
]

export default function MobileHomePage() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <p className="text-white/60 text-sm">Good morning,</p>
        <h1 className="text-2xl font-bold text-white mt-1">Rajesh Kumar</h1>
        <p className="text-white/40 text-xs mt-1">Shree Krishna Textiles</p>
      </header>

      {/* Quick Actions Grid */}
      <main className="flex-1 px-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={cn(
                "aspect-square rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-br",
                action.gradient
              )}
              style={{ boxShadow: `0 10px 40px -10px ${action.color}50` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">{action.name}</span>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-medium text-white/60">Today&apos;s Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#2A2A2A] rounded-xl p-4 border border-[#555555]/30">
              <p className="text-xs text-white/50">Active Orders</p>
              <p className="text-2xl font-bold text-[#FFD700] mt-1">156</p>
            </div>
            <div className="bg-[#2A2A2A] rounded-xl p-4 border border-[#555555]/30">
              <p className="text-xs text-white/50">Pending Challans</p>
              <p className="text-2xl font-bold text-[#FF6B35] mt-1">43</p>
            </div>
            <div className="bg-[#2A2A2A] rounded-xl p-4 border border-[#555555]/30">
              <p className="text-xs text-white/50">In Production</p>
              <p className="text-2xl font-bold text-[#3B82F6] mt-1">234</p>
            </div>
            <div className="bg-[#2A2A2A] rounded-xl p-4 border border-[#555555]/30">
              <p className="text-xs text-white/50">Delivered</p>
              <p className="text-2xl font-bold text-[#10B981] mt-1">89</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-[#555555]/50 px-6 py-3 pb-6">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all",
                    isActive
                      ? "text-[#FFD700] bg-[#FFD700]/10"
                      : "text-white/50"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
