"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  Home,
  Layers,
  FileText,
  Truck,
  Settings2,
  Users,
  Cpu,
  Package,
  IndianRupee,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Design No", href: "/designs", icon: Layers },
  { name: "Order No", href: "/orders", icon: FileText },
  { name: "Challan", href: "/challan", icon: Truck },
  { name: "Production", href: "/production", icon: Settings2 },
  { name: "Workers", href: "/workers", icon: Users },
  { name: "Machines", href: "/machines", icon: Cpu },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Finance", href: "/finance", icon: IndianRupee },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Team", href: "/team", icon: Users },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { appUser, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const userInitials = appUser?.name
    ? appUser.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-[#1A1A2E] border-r border-[#555555] transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[#555555]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFD700] flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
              stroke="#1A1A2E"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-[#FFD700]">TextileApp</span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-[#2A2A2A] text-white/70 hover:text-white transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            // Only show Team to owner/manager
            if (item.name === "Team" && appUser?.role !== "owner" && appUser?.role !== "manager") {
              return null
            }

            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-[#FFD700]/10 text-[#FFD700] border-l-4 border-[#FFD700] -ml-0.5"
                      : "text-white/70 hover:text-white hover:bg-[#2A2A2A]"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-[#FFD700]")} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-[#555555]">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          {appUser?.avatar_url ? (
            <img
              src={appUser.avatar_url}
              alt={appUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-[#1A1A2E] font-semibold">
              {userInitials}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {appUser?.name || "User"}
              </p>
              <p className="text-xs text-white/50 capitalize">
                {appUser?.role || "—"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-2 mt-4 text-sm text-white/70 hover:text-[#E94560] transition-colors",
            isCollapsed && "justify-center w-full"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  const pathname = usePathname()
  const { appUser, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const userInitials = appUser?.name
    ? appUser.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??"

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#2A2A2A] text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#1A1A2E] border-r border-[#555555] transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-[#555555]">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded-lg bg-[#FFD700] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6"
                stroke="#1A1A2E"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#FFD700]">TextileApp</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#2A2A2A] text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              if (item.name === "Team" && appUser?.role !== "owner" && appUser?.role !== "manager") {
                return null
              }
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-[#FFD700]/10 text-[#FFD700] border-l-4 border-[#FFD700] -ml-0.5"
                        : "text-white/70 hover:text-white hover:bg-[#2A2A2A]"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive && "text-[#FFD700]")} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-[#555555]">
          <div className="flex items-center gap-3">
            {appUser?.avatar_url ? (
              <img
                src={appUser.avatar_url}
                alt={appUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-[#1A1A2E] font-semibold">
                {userInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {appUser?.name || "User"}
              </p>
              <p className="text-xs text-white/50 capitalize">
                {appUser?.role || "—"}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 mt-4 text-sm text-white/70 hover:text-[#E94560] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
