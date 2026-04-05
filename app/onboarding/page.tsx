"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

// ─── Machine options ────────────────────────────────────────────────────────
const MACHINES = [
  { id: "embroidery",     label: "Embroidery Machine",    icon: "🧵", desc: "In-house embroidery stitching on fabric" },
  { id: "jacquard",       label: "Jacquard Machine",      icon: "🪡", desc: "Woven pattern / jacquard design work" },
  { id: "position_print", label: "Position Print Machine",icon: "🖨️", desc: "Placement printing on garment / saree" },
]

// ─── Outsourced process options ──────────────────────────────────────────────
const PROCESSES = [
  { id: "bleach",       label: "Bleach",       icon: "🫧", desc: "Sent to bleach karigar for whitening" },
  { id: "cotting",      label: "Cotting",      icon: "✂️", desc: "Sent to cotting karigar for thread fixing" },
  { id: "butta_cutting",label: "Butta Cutting",icon: "🔪", desc: "Sent to cutting karigar to trim motifs" },
  { id: "finishing",    label: "Finishing",    icon: "✨", desc: "Sent to finishing karigar for final polish" },
]

// ─── Always-included stages ──────────────────────────────────────────────────
const ALWAYS_ON = [
  { id: "checking", label: "Final Checking", icon: "🔍" },
  { id: "delivery", label: "Delivery",        icon: "🚚" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { company, refreshUser } = useAuth()

  // step 1 = pick machines, step 2 = pick processes, step 3 = confirm
  const [step, setStep] = useState(1)
  const [selectedMachines, setSelectedMachines] = useState<string[]>([])
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggleMachine = (id: string) => {
    setSelectedMachines((prev) => 
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const toggleProcess = (id: string) => {
    setSelectedProcesses((prev) => 
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleFinish = async () => {
    if (!company) return
    setSaving(true)
    console.log("handleFinish: starting. Machines:", selectedMachines, "Processes:", selectedProcesses)
    try {
      const allProcesses = [
        ...selectedProcesses,
        "checking",
        "delivery",
      ]

      console.log("handleFinish: updating companies...")
      const { data: updateData, error: updateError } = await supabase
        .from("companies")
        .update({
          active_machines: selectedMachines,
          active_processes: allProcesses,
          onboarding_done: true,
        })
        .eq("id", company.id)
        .select()
      
      console.log("handleFinish: companies update result:", { updateData, updateError })
      if (updateError) throw updateError
      if (!updateData || updateData.length === 0) {
        throw new Error("Update failed: Company row not found or RLS blocked the update. Are you sure you have an UPDATE policy for companies?")
      }

      console.log("handleFinish: deleting old stage_sequence...")
      const { error: deleteError } = await supabase.from("stage_sequence").delete().eq("company_id", company.id)
      if (deleteError) throw deleteError

      const stages = [
        ...selectedMachines.map((m, i) => ({
          company_id: company.id,
          stage_order: i + 1,
          stage_name: m,
          stage_type: "machine",
          is_active: true,
        })),
        ...allProcesses.map((p, i) => ({
          company_id: company.id,
          stage_order: selectedMachines.length + i + 1,
          stage_name: p,
          stage_type: p === "checking" ? "checking" : p === "delivery" ? "delivery" : "outsourced",
          is_active: true,
        })),
      ]

      if (stages.length > 0) {
        console.log("handleFinish: inserting new stage_sequence...", stages)
        const { error: insertError } = await supabase.from("stage_sequence").insert(stages as any)
        console.log("handleFinish: insert result error:", insertError)
        if (insertError) throw insertError
      }

      console.log("handleFinish: refreshing user...")
      await refreshUser()
      console.log("handleFinish: setup complete, pushing to /")
      toast.success("Setup complete! Welcome to TextileApp 🎉")
      router.push("/")
    } catch (err: any) {
      toast.error(err.message || "Setup failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Labels for summary bar
  const selectedMachineObjs = MACHINES.filter((m) => selectedMachines.includes(m.id))
  const selectedProcessObjs = PROCESSES.filter((p) => selectedProcesses.includes(p.id))

  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FFD700] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FFD700]/30">
            <span className="text-3xl">🏭</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Factory Setup</h1>
          <p className="text-white/50 text-sm mt-1">
            Tell us how your factory works — we'll configure the system for you
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s ? "bg-[#FFD700] text-[#1A1A2E]" : "bg-white/10 text-white/30"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 transition-all duration-500 ${
                    step > s ? "bg-[#FFD700]" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">

          {/* STEP 1 — Pick machines */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Which machines do you use?</h2>
                <p className="text-white/40 text-sm mt-1">Select all that apply. You can change this later.</p>
              </div>
              <div className="space-y-3">
                {MACHINES.map((m) => {
                  const active = selectedMachines.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMachine(m.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                        active
                          ? "bg-[#FFD700]/15 border-[#FFD700] text-white scale-[1.01]"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:bg-white/8"
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{m.label}</p>
                        <p className="text-xs opacity-60 mt-0.5">{m.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          active ? "bg-[#FFD700] border-[#FFD700]" : "border-white/30"
                        }`}
                      >
                        {active && (
                          <svg className="w-3 h-3 text-[#1A1A2E]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Pick outsourced processes */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Which processes do you outsource?</h2>
                <p className="text-white/40 text-sm mt-1">Select multiple if needed. A challan is generated for each.</p>
              </div>
              <div className="space-y-3">
                {PROCESSES.map((p) => {
                  const active = selectedProcesses.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProcess(p.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                        active
                          ? "bg-[#FFD700]/15 border-[#FFD700] text-white scale-[1.01]"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:bg-white/8"
                      }`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{p.label}</p>
                        <p className="text-xs opacity-60 mt-0.5">{p.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          active ? "bg-[#FFD700] border-[#FFD700]" : "border-white/30"
                        }`}
                      >
                        {active && (
                          <svg className="w-3 h-3 text-[#1A1A2E]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Your production flow</h2>
                <p className="text-white/40 text-sm mt-1">This is how every order will move through your factory.</p>
              </div>
              <div className="space-y-2">
                {selectedMachineObjs.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{m.label}</p>
                      <p className="text-white/40 text-xs">In-house machine</p>
                    </div>
                  </div>
                ))}
                {selectedProcessObjs.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                      {selectedMachineObjs.length + i + 1}
                    </span>
                    <span className="text-lg">{p.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{p.label}</p>
                      <p className="text-white/40 text-xs">Outsourced — challan required</p>
                    </div>
                  </div>
                ))}
                {ALWAYS_ON.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">
                      {selectedMachineObjs.length + selectedProcessObjs.length + i + 1}
                    </span>
                    <span className="text-lg">{a.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{a.label}</p>
                      <p className="text-white/40 text-xs">Always included</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12 rounded-xl border border-white/20 text-white/70 font-medium hover:bg-white/5 transition-all"
            >
              ← Back
            </button>
          )}
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 h-12 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all border border-white/20"
            >
              Continue →
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 h-12 rounded-xl bg-[#FFD700] text-[#1A1A2E] font-bold hover:bg-[#FFD700]/90 transition-all disabled:opacity-50 shadow-lg shadow-[#FFD700]/20 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
              ) : (
                "Start Using TextileApp 🚀"
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
