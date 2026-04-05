"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Machine, MachineInsert } from "@/lib/types/database.types"

export function useMachines() {
  const { company } = useAuth()
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMachines = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("machines")
      .select("*")
      .eq("company_id", company.id)
      .order("machine_name")

    if (err) setError(err.message)
    else setMachines(data || [])
    setLoading(false)
  }, [company])

  useEffect(() => { fetchMachines() }, [fetchMachines])

  const addMachine = async (machine: Omit<MachineInsert, "company_id">) => {
    if (!company) return null
    const { data, error: err } = await supabase
      .from("machines")
      .insert({ ...machine, company_id: company.id })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setMachines((prev) => [...prev, data])
    return data
  }

  const updateMachine = async (id: string, updates: Partial<MachineInsert>) => {
    const { data, error: err } = await supabase
      .from("machines")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setMachines((prev) => prev.map((m) => (m.id === id ? data : m)))
    return data
  }

  const deleteMachine = async (id: string) => {
    const { error: err } = await supabase.from("machines").delete().eq("id", id)
    if (err) { setError(err.message); return false }
    setMachines((prev) => prev.filter((m) => m.id !== id))
    return true
  }

  return { machines, loading, error, addMachine, updateMachine, deleteMachine, refresh: fetchMachines }
}
