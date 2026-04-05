"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Challan, ChallanInsert, ChallanLine, ChallanLineInsert, ReceivingChallan, ReceivingChallanInsert } from "@/lib/types/database.types"

export interface ChallanWithLines extends Challan {
  challan_lines: ChallanLine[]
  workers?: { worker_name: string } | null
}

export function useChallans() {
  const { company, appUser } = useAuth()
  const [challans, setChallans] = useState<ChallanWithLines[]>([])
  const [receivingChallans, setReceivingChallans] = useState<ReceivingChallan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallans = useCallback(async () => {
    if (!company) return
    setLoading(true)

    const { data, error: err } = await supabase
      .from("challans")
      .select("*, challan_lines(*), workers(worker_name)")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })

    if (err) setError(err.message)
    else setChallans((data as unknown as ChallanWithLines[]) || [])
    setLoading(false)
  }, [company])

  const fetchReceivingChallans = useCallback(async () => {
    if (!company) return
    const { data, error: err } = await supabase
      .from("receiving_challans")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })

    if (err) setError(err.message)
    else setReceivingChallans((data as unknown as ReceivingChallan[]) || [])
  }, [company])

  useEffect(() => {
    fetchChallans()
    fetchReceivingChallans()
  }, [fetchChallans, fetchReceivingChallans])

  const sendChallan = async (
    challan: Omit<ChallanInsert, "company_id" | "challan_number" | "sent_by" | "created_at">,
    lines: Omit<ChallanLineInsert, "challan_id">[]
  ) => {
    if (!company || !appUser) return null

    const { data: challanNum, error: counterErr } = await supabase.rpc("get_next_counter", {
      p_company_id: company.id,
      p_type: "challan",
    })
    if (counterErr) { setError(counterErr.message); return null }

    const { data: newChallan, error: challanErr } = await supabase
      .from("challans")
      .insert({
        ...challan,
        company_id: company.id,
        challan_number: challanNum,
        sent_by: appUser.id,
      })
      .select()
      .single()

    if (challanErr) { setError(challanErr.message); return null }

    if (lines.length > 0) {
      const challanLines = lines.map((line) => ({ ...line, challan_id: newChallan.id }))
      await supabase.from("challan_lines").insert(challanLines)
    }

    await fetchChallans()
    return newChallan
  }

  const receiveChallan = async (receiving: Omit<ReceivingChallanInsert, "company_id" | "received_by" | "created_at">) => {
    if (!company || !appUser) return null

    const { data, error: err } = await supabase
      .from("receiving_challans")
      .insert({
        ...receiving,
        company_id: company.id,
        received_by: appUser.id,
      })
      .select()
      .single()

    if (err) { setError(err.message); return null }

    // Update original challan status
    if (receiving.challan_id) {
      await supabase
        .from("challans")
        .update({ status: "fully_received" })
        .eq("id", receiving.challan_id)
    }

    await fetchReceivingChallans()
    await fetchChallans()
    return data
  }

  return {
    challans,
    receivingChallans,
    loading,
    error,
    sendChallan,
    receiveChallan,
    refresh: () => { fetchChallans(); fetchReceivingChallans() },
  }
}
