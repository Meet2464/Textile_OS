"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Building2, UserPlus } from "lucide-react"
import type { Database } from "@/lib/types/database.types"

type SetupStep = "role" | "boss-setup" | "employee-setup" | "pending"

export default function SetupPage() {
  const { authUser, refreshUser } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<SetupStep>("role")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Boss setup form
  const [companyName, setCompanyName] = useState("")
  const [companyCode, setCompanyCode] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [phone, setPhone] = useState("")

  // Employee setup form
  const [employeeCompanyCode, setEmployeeCompanyCode] = useState("")
  const [employeeName, setEmployeeName] = useState("")

  const handleBossSetup = async () => {
    if (!authUser) return
    if (!companyName.trim() || !companyCode.trim() || !ownerName.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          company_name: companyName.trim(),
          company_id_code: companyCode.trim().toUpperCase(),
          owner_name: ownerName.trim(),
          phone: phone.trim() || null,
          is_active: true,
        })
        .select()
        .single()

      if (companyError || !company) {
        if (companyError?.code === "23505") {
          setError("This Company ID is already taken. Please choose another.")
        } else {
          setError(companyError?.message ?? "Failed to create company")
        }
        setLoading(false)
        return
      }

      // 2. Create user record linked to auth and company
      const { error: userError } = await supabase.from("users").insert({
        auth_id: authUser.id,
        company_id: company.id,
        name: ownerName.trim(),
        email: authUser.email!,
        avatar_url: null,
        role: "boss",
        is_active: true,
        approved_by: null,
        approved_at: null,
      } as Database['public']['Tables']['users']['Insert'])

      if (userError) {
        setError(userError.message)
        setLoading(false)
        return
      }

      // 3. Initialize counters for this company
      await supabase.from("counters").insert([
        { company_id: company.id, counter_type: "po_number", current_value: 0, last_updated: new Date().toISOString() },
        { company_id: company.id, counter_type: "challan", current_value: 0, last_updated: new Date().toISOString() },
        { company_id: company.id, counter_type: "receiving", current_value: 0, last_updated: new Date().toISOString() },
      ])

      // 4. Refresh user context and redirect
      await refreshUser()
      router.push("/")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSetup = async () => {
    if (!authUser) return
    if (!employeeCompanyCode.trim()) {
      setError("Please enter the Company ID")
      return
    }
    if (!employeeName.trim()) {
      setError("Please enter your name")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Find company by code
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("company_id_code", employeeCompanyCode.trim().toUpperCase())
        .single()

      if (companyError || !company) {
        setError("Company not found. Please check the Company ID and try again.")
        setLoading(false)
        return
      }

      // 2. Create user (inactive until boss approves)
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          auth_id: authUser.id,
          company_id: company.id,
          name: employeeName.trim(),
          email: authUser.email!,
          avatar_url: null,
          role: "employee",
          is_active: false,
          approved_by: null,
          approved_at: null,
        } as Database['public']['Tables']['users']['Insert'])
        .select()
        .single()

      if (userError || !newUser) {
        if (userError?.code === "23505") {
          setError("This email is already registered.")
        } else {
          setError(userError?.message ?? "Failed to create user")
        }
        setLoading(false)
        return
      }

      // 3. Create approval request
      await supabase.from("approval_requests").insert({
        employee_id: newUser.id,
        company_id: company.id,
        requested_company_code: employeeCompanyCode.trim().toUpperCase(),
        status: "pending",
        requested_at: new Date().toISOString(),
      })

      setStep("pending")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD700] flex items-center justify-center mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-10 h-10"
              stroke="#1A1A2E"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#FFD700]">TextileApp</h1>
        </div>

        {/* Role Selection */}
        {step === "role" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Welcome! Let&apos;s get you set up</h2>
              <p className="text-sm text-white/60 mt-2">Choose how you want to use TextileApp</p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => setStep("boss-setup")}
                className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6 text-left hover:border-[#FFD700]/50 hover:bg-[#2A2A2A]/80 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FFD700]/20 flex items-center justify-center group-hover:bg-[#FFD700]/30 transition-colors">
                    <Building2 className="w-7 h-7 text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">I&apos;m a Boss</h3>
                    <p className="text-sm text-white/50 mt-1">Create a new company and start managing</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep("employee-setup")}
                className="bg-[#2A2A2A] rounded-xl border border-[#555555]/50 p-6 text-left hover:border-[#3B82F6]/50 hover:bg-[#2A2A2A]/80 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#3B82F6]/20 flex items-center justify-center group-hover:bg-[#3B82F6]/30 transition-colors">
                    <UserPlus className="w-7 h-7 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">I&apos;m an Employee</h3>
                    <p className="text-sm text-white/50 mt-1">Join an existing company with a Company ID</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Boss Setup */}
        {step === "boss-setup" && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => { setStep("role"); setError(null) }}
                className="text-sm text-white/50 hover:text-white transition-colors mb-4"
              >
                ← Back
              </button>
              <h2 className="text-xl font-semibold text-white">Create Your Company</h2>
              <p className="text-sm text-white/60 mt-2">Set up your textile business on TextileApp</p>
            </div>

            {error && (
              <div className="bg-[#E94560]/20 border border-[#E94560]/30 text-[#E94560] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Shree Krishna Textiles"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Company ID *</label>
                <input
                  type="text"
                  placeholder="e.g. SKT001 (unique code for login)"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all uppercase"
                />
                <p className="text-xs text-white/40">Share this code with your employees to join</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Owner Name *</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
                />
              </div>

              <button
                onClick={handleBossSetup}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#FFD700] text-[#1A1A2E] font-semibold hover:bg-[#FFD700]/90 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
                ) : (
                  "Create Company & Start"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Employee Setup */}
        {step === "employee-setup" && (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => { setStep("role"); setError(null) }}
                className="text-sm text-white/50 hover:text-white transition-colors mb-4"
              >
                ← Back
              </button>
              <h2 className="text-xl font-semibold text-white">Join a Company</h2>
              <p className="text-sm text-white/60 mt-2">Enter the Company ID your boss gave you</p>
            </div>

            {error && (
              <div className="bg-[#E94560]/20 border border-[#E94560]/30 text-[#E94560] px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Company ID *</label>
                <input
                  type="text"
                  placeholder="e.g. SKT001"
                  value={employeeCompanyCode}
                  onChange={(e) => setEmployeeCompanyCode(e.target.value.toUpperCase())}
                  className="w-full h-12 px-4 rounded-xl bg-[#2A2A2A] border border-[#555555] text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all uppercase"
                />
              </div>

              <button
                onClick={handleEmployeeSetup}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#3B82F6] text-white font-semibold hover:bg-[#3B82F6]/90 transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Request to Join"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Pending Approval */}
        {step === "pending" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#FFD700]/20 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-[#FFD700]" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Request Sent!</h2>
              <p className="text-sm text-white/60 mt-2 leading-relaxed">
                Your request has been sent to the company boss for approval.
                You&apos;ll be able to access the app once they approve your request.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 rounded-xl bg-[#2A2A2A] text-white/80 hover:text-white font-medium text-sm hover:bg-[#555555]/50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
