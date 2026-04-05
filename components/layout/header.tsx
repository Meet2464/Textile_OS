"use client"

import { useState } from "react"
import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#1A1A2E]/95 backdrop-blur-sm border-b border-[#555555] px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Page Title */}
      <h1 className="text-lg lg:text-xl font-semibold text-white hidden sm:block">{title}</h1>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-auto sm:mx-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search orders, designs, challans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors">
          <Bell className="w-5 h-5 text-white/70" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E94560] text-[10px] font-medium text-white flex items-center justify-center">
            5
          </span>
        </button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-[#1A1A2E] font-semibold text-sm">
                RK
              </div>
              <ChevronDown className="w-4 h-4 text-white/50 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#2A2A2A] border-[#555555]">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-white">Rajesh Kumar</p>
              <p className="text-xs text-white/50">rajesh@textileapp.com</p>
            </div>
            <DropdownMenuSeparator className="bg-[#555555]" />
            <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-[#1A1A2E] cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white/70 hover:text-white hover:bg-[#1A1A2E] cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#555555]" />
            <DropdownMenuItem className="text-[#E94560] hover:text-[#E94560] hover:bg-[#1A1A2E] cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
