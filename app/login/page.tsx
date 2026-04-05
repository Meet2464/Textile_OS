"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const { authUser, appUser, company, loading, signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && authUser) {
      if (appUser && company) {
        if (!appUser.is_active) {
          setError("Your account is inactive. Please contact your administrator.")
          supabase.auth.signOut()
        } else {
          router.push("/")
        }
      } else if (appUser === null) {
        // auth exists but no DB profile — orphan auth user, sign out cleanly
        setError("Account setup incomplete. Please register again.")
        supabase.auth.signOut()
      }
    }
  }, [loading, authUser, appUser, company, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError("Please enter your email and password")
      return
    }

    setSubmitting(true)
    setError("")

    const result = await signIn(email.trim(), password)
    if (!result.success) {
      setError(result.error || "Invalid email or password")
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A2E]">
      {/* Gold Header Section */}
      <div className="bg-[#FFD700] pt-16 pb-24 px-6 flex flex-col items-center justify-center relative">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-[#1A1A2E] flex items-center justify-center mb-4 shadow-xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-12 h-12"
            stroke="#FFD700"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A2E]">TextileApp</h1>
        <p className="text-[#1A1A2E]/70 text-sm mt-1">Textile ERP Management</p>
      </div>

      {/* White Form Card */}
      <div className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 py-10 relative flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#1A1A2E] text-center">Welcome Back</h2>
        <p className="text-[#1A1A2E]/60 text-center mt-2 text-sm">
          Sign in with your email and password
        </p>

        <form onSubmit={handleLogin} className="mt-8 w-full max-w-sm space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#1A1A2E]/70">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/30" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#1A1A2E]/70">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/30" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                className="w-full h-14 pl-12 pr-12 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A2E]/30 hover:text-[#1A1A2E]/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full h-14 rounded-xl bg-[#FFD700] text-[#1A1A2E] font-bold text-base hover:bg-[#FFD700]/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FFD700]/30 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E0E0E0]" />
            <span className="text-xs text-[#1A1A2E]/40 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#E0E0E0]" />
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full h-14 rounded-xl bg-[#1A1A2E] text-white font-semibold hover:bg-[#1A1A2E]/90 transition-all active:scale-[0.98]"
          >
            Create New Account
          </button>

          <p className="text-center text-xs text-[#1A1A2E]/40 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your data is secured with enterprise-grade encryption.
          </p>
        </form>
      </div>
    </div>
  )
}
