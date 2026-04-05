"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar, MobileSidebar } from "./sidebar"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { authUser, appUser, company, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!authUser || !appUser || !company) {
        router.push("/login")
      } else if (!appUser.is_active) {
        router.push("/login")
      } else if (company.onboarding_done === false && appUser.role === "boss") {
        router.push("/onboarding")
      }
    }
  }, [loading, authUser, appUser, company, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authUser || !appUser || !company) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
