"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Users, Plus, QrCode, Mail, Copy, Check, X, Shield, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/types/database.types"
import { useAuth } from "@/lib/auth-context"
import toast from "react-hot-toast"
import { QRCodeSVG } from "qrcode.react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface InviteToken {
  id: string
  role: string
  email: string | null
  token: string
  is_used: boolean
  expires_at: string
}

export default function TeamPage() {
  const { appUser, company } = useAuth()
  
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<InviteToken[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteRole, setInviteRole] = useState("worker")
  const [inviteEmail, setInviteEmail] = useState("")
  const [generatedInvite, setGeneratedInvite] = useState<{ url: string, token: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const isOwnerOrManager = appUser?.role === 'owner' || appUser?.role === 'manager'

  useEffect(() => {
    if (appUser && company) {
      fetchTeamData()
    }
  }, [appUser, company])

  const fetchTeamData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', company!.id)
        .order('created_at', { ascending: false })
      
      if (usersError) throw usersError
      setMembers(usersData || [])

      // 2. Fetch Active Invites (if owner/manager)
      if (isOwnerOrManager) {
        const { data: invitesData, error: invitesError } = await supabase
          .from('invite_tokens')
          .select('*')
          .eq('company_id', company!.id)
          .eq('is_used', false)
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: true })

        if (invitesError) throw invitesError
        setInvites(invitesData || [])
      }
    } catch (error: any) {
      console.error("Error fetching team:", error.message)
      toast.error("Failed to load team data")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: inviteRole,
          email: inviteEmail || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate invite")
      }

      setGeneratedInvite({
        url: data.inviteUrl,
        token: data.invite.token
      })
      
      // Refresh invites list
      fetchTeamData()
      toast.success("Invite link generated!")

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (generatedInvite) {
      navigator.clipboard.writeText(generatedInvite.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Link copied to clipboard")
    }
  }

  const deleteInvite = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('invite_tokens')
        .delete()
        .eq('id', tokenId)
      
      if (error) throw error
      
      toast.success("Invite canceled")
      setInvites(invites.filter(i => i.id !== tokenId))
    } catch (err: any) {
      toast.error("Failed to cancel invite")
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean, role: string) => {
    if (role === 'owner') {
      toast.error("Cannot modify owner status")
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus } as never)
        .eq('id', userId)

      if (error) throw error

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
      setMembers(members.map(m => m.id === userId ? { ...m, is_active: !currentStatus } : m))
    } catch (error: any) {
      toast.error("Failed to update user status")
    }
  }

  const RoleBadge = ({ role }: { role: string }) => {
    const colors: Record<string, string> = {
      owner: "bg-purple-100 text-purple-700 border-purple-200",
      manager: "bg-blue-100 text-blue-700 border-blue-200",
      designer: "bg-pink-100 text-pink-700 border-pink-200",
      worker: "bg-green-100 text-green-700 border-green-200",
      accountant: "bg-amber-100 text-amber-700 border-amber-200"
    }

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase ${colors[role] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
        {role}
      </span>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="Team Management">
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Team Management">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#FFD700]" />
              {company?.company_name} Team
            </h2>
            <p className="text-sm text-[#1A1A2E]/60 mt-1">
              Manage your employees, roles, and access.
            </p>
          </div>
          
          {isOwnerOrManager && (
            <button
              onClick={() => {
                setGeneratedInvite(null)
                setInviteEmail("")
                setIsInviteModalOpen(true)
              }}
              className="px-5 py-2.5 bg-[#1A1A2E] text-white font-medium rounded-xl flex items-center gap-2 hover:bg-[#1A1A2E]/90 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Invite Member
            </button>
          )}
        </div>

        {/* Active Invites Section (Only if any exist) */}
        {isOwnerOrManager && invites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
            <div className="p-4 border-b border-orange-100 bg-orange-50/50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-[#1A1A2E]">Pending Invites ({invites.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {invites.map((invite) => (
                <div key={invite.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A1A2E]">
                          {invite.email ? invite.email : "Open QR Invite"}
                        </span>
                        <RoleBadge role={invite.role} />
                      </div>
                      <p className="text-xs text-[#1A1A2E]/50 mt-1 truncate max-w-xs">
                        {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/{invite.token}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invite.token}`)
                        toast.success("Link copied!")
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors border border-gray-200"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteInvite(invite.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F9FA] text-[#1A1A2E]/60 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Name / Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  {isOwnerOrManager && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A1A2E]/5 flex items-center justify-center font-bold text-[#1A1A2E]">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1A2E]">{member.name}</p>
                          <p className="text-[#1A1A2E]/50 text-xs">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-xs font-medium ${member.is_active ? 'text-green-700' : 'text-red-700'}`}>
                          {member.is_active ? 'Active' : 'Archived'}
                        </span>
                      </div>
                    </td>
                    {isOwnerOrManager && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleUserStatus(member.id, member.is_active, member.role)}
                          disabled={member.role === 'owner'}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                            member.role === 'owner' 
                              ? 'opacity-30 cursor-not-allowed border-gray-200 text-gray-500 bg-gray-50' 
                              : member.is_active 
                                ? 'border-red-200 text-red-600 hover:bg-red-50' 
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {member.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FFD700]" />
                Invite New Member
              </h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!generatedInvite ? (
                <form onSubmit={handleGenerateInvite} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1A1A2E]/70">Access Role</label>
                    <div className="relative">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 appearance-none transition-all"
                      >
                        <option value="worker">Worker (Scan & Update Production)</option>
                        <option value="designer">Designer (Manage Designs via CMS)</option>
                        <option value="manager">Manager (Full Access, Cannot Delete DB)</option>
                        <option value="accountant">Accountant (Billing & Payments)</option>
                        {appUser?.role === 'owner' && <option value="owner">Co-Owner</option>}
                      </select>
                      <Shield className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#1A1A2E]/70">Email Address (Optional)</label>
                    <p className="text-xs text-gray-500 mb-2">Leave blank to generate an open QR code</p>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A1A2E]/30" />
                      <input
                        type="email"
                        placeholder="employee@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full h-12 mt-4 bg-[#FFD700] text-[#1A1A2E] font-bold text-sm rounded-xl hover:bg-[#FFD700]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        Generate Invite Link & QR
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-[#FFD700]/50 shadow-sm mb-6">
                    <QRCodeSVG
                      value={generatedInvite.url}
                      size={200}
                      level={"H"}
                      includeMargin={false}
                      imageSettings={{
                        src: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // Generic logo just to make it pretty, can be swapped for app logo
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                  
                  <h4 className="text-lg font-bold text-[#1A1A2E] mb-1">Invite Generated!</h4>
                  <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
                    Ask the team member to scan this QR code with their phone camera, or send them the link below.
                  </p>

                  <div className="w-full flex items-center gap-2">
                    <div className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 flex items-center overflow-hidden">
                      <span className="text-xs text-gray-600 truncate">{generatedInvite.url}</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className={`h-12 px-4 rounded-xl font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                        copied ? 'bg-green-100 text-green-700' : 'bg-[#1A1A2E] text-white hover:bg-[#1A1A2E]/90 active:scale-95'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsInviteModalOpen(false)
                      setGeneratedInvite(null)
                    }}
                    className="mt-6 text-sm font-medium text-gray-500 hover:text-[#1A1A2E]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
