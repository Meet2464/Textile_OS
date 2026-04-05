"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Pencil, LogOut, ChevronRight, User, Mail, Building, Shield } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  const profileData = {
    name: "Rajesh Kumar",
    email: "rajesh@textileapp.com",
    companyId: "TXL-001",
    role: "Admin",
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#555555]/50">
        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-[#2A2A2A] text-white/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Profile</h1>
        <div className="w-9" />
      </header>

      <main className="p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#FFD700] flex items-center justify-center text-[#1A1A2E] text-3xl font-bold">
              RK
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2A2A2A] border-2 border-[#1A1A2E] flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-white mt-4">{profileData.name}</h2>
          <span className="text-sm text-[#FFD700] mt-1">{profileData.role}</span>
        </div>

        {/* Profile Info */}
        <div className="mt-8 space-y-3">
          <div className="bg-[#2A2A2A] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center">
              <User className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50">Full Name</p>
              <p className="text-sm text-white mt-0.5">{profileData.name}</p>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50">Email Address</p>
              <p className="text-sm text-white mt-0.5">{profileData.email}</p>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center">
              <Building className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50">Company ID</p>
              <p className="text-sm text-white mt-0.5">{profileData.companyId}</p>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#1A1A2E] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white/50" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/50">Role</p>
              <p className="text-sm text-white mt-0.5">{profileData.role}</p>
            </div>
          </div>
        </div>

        {/* Settings Links */}
        <div className="mt-8 space-y-2">
          <Link
            href="/settings"
            className="flex items-center justify-between bg-[#2A2A2A] rounded-xl p-4 hover:bg-[#2A2A2A]/80 transition-colors"
          >
            <span className="text-sm text-white">Settings</span>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </Link>
          <Link
            href="#"
            className="flex items-center justify-between bg-[#2A2A2A] rounded-xl p-4 hover:bg-[#2A2A2A]/80 transition-colors"
          >
            <span className="text-sm text-white">Help & Support</span>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </Link>
        </div>

        {/* Logout Button */}
        <button className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-xl bg-[#E94560]/20 text-[#E94560] font-medium hover:bg-[#E94560]/30 transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </main>
    </div>
  )
}
