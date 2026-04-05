"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2, ShieldAlert } from "lucide-react"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import { useAuth } from "@/lib/auth-context"
import type { Database } from "@/lib/types/database.types"

interface InviteDetails {
  id: string
  role: string
  email: string | null
  company_id: string
  company_name: string
}

export default function InviteRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const { signUp, signOut, authUser } = useAuth()
  
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [inviteError, setInviteError] = useState("")
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Sign out any existing user on mount (once only)
  useEffect(() => {
    if (authUser) {
      signOut()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch('/api/invite/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to validate invite")
        }

        setInviteDetails(data.invite)
        if (data.invite.email) {
          setEmail(data.invite.email)
        }
      } catch (err: any) {
        setInviteError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      validateToken()
    }
  }, [token])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !password) {
      setFormError("Please fill in all fields")
      return
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    setSubmitting(true)
    setFormError("")

    try {
      // 1. Create Auth Account
      const { data: authData, error: authError } = await signUp(email.trim(), password)
      
      if (authError) throw new Error(authError)
      if (!authData?.user) throw new Error("Failed to create auth user")

      const authId = authData.user.id

      // 2. Insert User Profile
      // For specific roles, we might set is_active to false requiring approval,
      // but invites generally bypass approval since owner created them explicitly.
      const { error: userError } = await supabase
        .from('users')
        .insert({
          auth_id: authId,
          company_id: inviteDetails!.company_id,
          name: name.trim(),
          email: email.trim(),
          role: inviteDetails!.role as any,
          is_active: true
        } as Database['public']['Tables']['users']['Insert'])

      if (userError) throw new Error(`User profile creation failed: ${userError.message}`)

      // 3. Mark Invite as Used
      // We must use the Service Role to update this since the new user doesn't have permission 
      // yet (RLS) or we can use a secure RPC/API. Let's make an API call.
      const markUsedResponse = await fetch('/api/invite/mark-used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: inviteDetails!.id })
      })

      if (!markUsedResponse.ok) {
         console.warn("Failed to mark token as used, but user was created.")
      }

      toast.success("Successfully joined company!")
      router.push("/") // AuthGuard handles redirect to dashboard

    } catch (err: any) {
      console.error(err)
      setFormError(err.message || "Registration failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mb-4" />
        <p className="text-[#FFD700] animate-pulse">Checking invite link...</p>
      </div>
    )
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-[#1A1A2E] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 shadow-xl border border-red-500/20">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Invalid Invite</h1>
        <p className="text-white/60 mb-8 max-w-sm">{inviteError}</p>
        <button
          onClick={() => router.push("/login")}
          className="px-8 h-12 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
        >
          Return to Login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A2E]">
      {/* Gold Header */}
      <div className="bg-[#FFD700] pt-12 pb-24 px-6 flex flex-col items-center justify-center relative">
        <div className="w-16 h-16 rounded-2xl bg-[#1A1A2E] flex items-center justify-center mb-4 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-[#FFD700]" />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A2E] text-center max-w-md">
          Join {inviteDetails?.company_name}
        </h1>
        <p className="text-[#1A1A2E]/80 text-sm mt-2 font-medium bg-black/5 px-4 py-1.5 rounded-full">
          You have been invited as a <span className="font-bold uppercase">{inviteDetails?.role}</span>
        </p>
      </div>

      {/* White Form Card */}
      <div className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 py-8 relative flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#1A1A2E] text-center">Complete Setup</h2>
        <p className="text-[#1A1A2E]/60 text-center mt-2 text-sm max-w-sm">
          Create your account to accept the invitation and join the workspace.
        </p>

        <form onSubmit={handleRegister} className="mt-8 w-full max-w-sm space-y-4 pb-8">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A2E]/70">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/30" />
              <input
                required
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError("") }}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A2E]/70">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/30" />
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                // Only allow editing if the invite wasn't restricted to a specific email
                disabled={!!inviteDetails?.email}
                onChange={(e) => { setEmail(e.target.value); setFormError("") }}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all disabled:opacity-60 disabled:bg-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A2E]/70">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A2E]/30" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFormError("") }}
                  className="w-full h-12 pl-10 pr-10 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A2E]/70">Confirm</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1A2E]/30" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat pwd"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFormError("") }}
                  className="w-full h-12 pl-10 pr-10 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A2E]/30 hover:text-[#1A1A2E]/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Join Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 mt-4 bg-[#FFD700] text-[#1A1A2E] font-bold text-base rounded-xl shadow-lg shadow-[#FFD700]/30 hover:bg-[#FFD700]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
            ) : (
              "Join Workspace"
            )}
          </button>
          
          <p className="text-center text-sm text-[#1A1A2E]/50 mt-4">
            If you already have an account, login first then click the invite link again.
          </p>
        </form>
      </div>
    </div>
  )
}
