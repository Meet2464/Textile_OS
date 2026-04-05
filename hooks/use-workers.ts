"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Worker, WorkerInsert } from "@/lib/types/database.types"

export function useWorkers() {
  const { company } = useAuth()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkers = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("workers")
      .select("*")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .order("worker_name")

    if (err) setError(err.message)
    else setWorkers((data as unknown as Worker[]) || [])
    setLoading(false)
  }, [company])

  useEffect(() => { fetchWorkers() }, [fetchWorkers])

  const addWorker = async (worker: Omit<WorkerInsert, "company_id" | "is_active">) => {
    if (!company) return null
    const { data, error: err } = await supabase
      .from("workers")
      .insert({ ...worker, company_id: company.id, is_active: true })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setWorkers((prev) => [...prev, data as unknown as Worker])
    return data
  }

  const updateWorker = async (id: string, updates: Partial<WorkerInsert>) => {
    const { data, error: err } = await supabase
      .from("workers")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setWorkers((prev) => prev.map((w) => (w.id === id ? (data as unknown as Worker) : w)))
    return data
  }

  const deleteWorker = async (id: string) => {
    const { error: err } = await supabase
      .from("workers")
      .update({ is_active: false })
      .eq("id", id)
    if (err) { setError(err.message); return false }
    setWorkers((prev) => prev.filter((w) => w.id !== id))
    return true
  }

  return { workers, loading, error, addWorker, updateWorker, deleteWorker, refresh: fetchWorkers }
}
