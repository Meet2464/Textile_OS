"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { ProductionStage, ProductionStageInsert, ProcessType } from "@/lib/types/database.types"

export function useProductionStages() {
  const { company } = useAuth()
  const [stages, setStages] = useState<ProductionStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStages = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("production_stages")
      .select("*")
      .eq("company_id", company.id)
      .order("started_at", { ascending: false })
    if (err) setError(err.message)
    else setStages((data as unknown as ProductionStage[]) || [])
    setLoading(false)
  }, [company])

  useEffect(() => { fetchStages() }, [fetchStages])

  const addStage = async (stage: Omit<ProductionStageInsert, "company_id">) => {
    if (!company) return null
    const { data, error: err } = await supabase
      .from("production_stages")
      .insert({ ...stage, company_id: company.id })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setStages((prev) => [data as unknown as ProductionStage, ...prev])
    return data
  }

  const updateStage = async (id: string, updates: Partial<ProductionStageInsert>) => {
    const { data, error: err } = await supabase
      .from("production_stages")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setStages((prev) => prev.map((s) => (s.id === id ? (data as unknown as ProductionStage) : s)))
    return data
  }

  const moveToNextStage = async (id: string, nextStage: ProcessType) => {
    const current = stages.find((s) => s.id === id)
    if (!current) return null

    // Complete current stage
    await updateStage(id, { status: "done", completed_at: new Date().toISOString() })

    // Create next stage
    return addStage({
      order_id: current.order_id,
      order_line_id: current.order_line_id,
      stage: nextStage,
      saree_type: current.saree_type,
      status: "pending",
      pieces_in: current.pieces_out || current.pieces_in,
      pieces_out: 0,
      challan_id: null,
      started_at: null,
      completed_at: null,
      worker_id: null,
      machine_id: null,
      notes: null,
    })
  }

  // Group stages by their process type for kanban view
  const stagesByProcess: Record<string, ProductionStage[]> = {}
  const processOrder: ProcessType[] = ["jecard", "butta_cutting", "bleach", "cotting", "position_print", "checking", "delivery"]
  processOrder.forEach((p) => {
    stagesByProcess[p] = stages.filter((s) => s.stage === p && s.status !== "done")
  })

  return { stages, stagesByProcess, processOrder, loading, error, addStage, updateStage, moveToNextStage, refresh: fetchStages }
}
