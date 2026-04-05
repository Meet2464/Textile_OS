"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, Building, User } from "lucide-react"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const { signIn, refreshUser } = useAuth()
  const router = useRouter()
  
  const [companyName, setCompanyName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Helper to generate a unique company code like "TEXTILE-A3X9K2"
  const generateCompanyCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like I,1,O,0
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `TEXTILE-${code}`
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Validation
    if (!companyName.trim() || !ownerName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      // Send everything to the server — server creates auth user + company + DB row atomically
      const regResponse = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          companyName: companyName.trim(),
          ownerName: ownerName.trim(),
          companyCode: generateCompanyCode(),
        }),
      })

      const regData = await regResponse.json()
      if (!regResponse.ok) {
        setError(regData.error || 'Registration failed')
        return
      }

      toast.success("Company registered successfully!")

      // Sign in directly — server already confirmed the auth user
      const signInResult = await signIn(email.trim(), password)
      if (!signInResult.success) {
        // Registered but sign-in failed — redirect to login
        router.push('/login')
        return
      }

      await refreshUser()
      router.push("/")

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A2E]">
      {/* Gold Header */}
      <div className="bg-[#FFD700] pt-12 pb-24 px-6 flex flex-col items-center justify-center relative">
        <div className="w-16 h-16 rounded-2xl bg-[#1A1A2E] flex items-center justify-center mb-4 shadow-xl">
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="#FFD700" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A2E]">TextileApp</h1>
        <p className="text-[#1A1A2E]/70 text-sm mt-1 font-medium">Register Your Company</p>
      </div>

      {/* White Form Card */}
      <div className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 py-8 relative flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#1A1A2E] text-center">Company Setup</h2>
        <p className="text-[#1A1A2E]/60 text-center mt-2 text-sm max-w-sm">
          Create a new workspace for your textile business. Only the owner needs to register here.
        </p>

        <form onSubmit={handleRegister} className="mt-8 w-full max-w-sm space-y-4 pb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A2E]/70">Company Name</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/30" />
              <input
                required
                type="text"
                placeholder="XYZ Textiles"
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); setError("") }}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
              />
            </div>
          </div>

          {/* Owner Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A2E]/70">Owner Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/30" />
              <input
                required
                type="text"
                placeholder="John Doe"
                value={ownerName}
                onChange={(e) => { setOwnerName(e.target.value); setError("") }}
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
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
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
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
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
                  onChange={(e) => { setConfirmPassword(e.target.value); setError("") }}
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

          {/* Create Company Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 mt-4 bg-[#FFD700] text-[#1A1A2E] font-bold text-base rounded-xl shadow-lg shadow-[#FFD700]/30 hover:bg-[#FFD700]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
            ) : (
              "Create Company"
            )}
          </button>

          <p className="text-center text-sm text-[#1A1A2E]/50 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-[#FFD700] font-semibold hover:underline"
              style={{ color: "#B8860B" }}
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
