"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Design, DesignInsert } from "@/lib/types/database.types"

export function useDesigns() {
  const { company } = useAuth()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDesigns = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("designs")
      .select("*")
      .eq("company_id", company.id)
      .eq("is_active", true)
      .order("date_added", { ascending: false })

    if (err) setError(err.message)
    else setDesigns(data || [])
    setLoading(false)
  }, [company])

  useEffect(() => { fetchDesigns() }, [fetchDesigns])

  const addDesign = async (design: Omit<DesignInsert, "company_id" | "is_active">) => {
    if (!company) return null
    const { data, error: err } = await supabase
      .from("designs")
      .insert({ ...design, company_id: company.id, is_active: true })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setDesigns((prev) => [data, ...prev])
    return data
  }

  const updateDesign = async (id: string, updates: Partial<DesignInsert>) => {
    const { data, error: err } = await supabase
      .from("designs")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setDesigns((prev) => prev.map((d) => (d.id === id ? data : d)))
    return data
  }

  const deleteDesign = async (id: string) => {
    const { error: err } = await supabase
      .from("designs")
      .update({ is_active: false })
      .eq("id", id)
    if (err) { setError(err.message); return false }
    setDesigns((prev) => prev.filter((d) => d.id !== id))
    return true
  }

  const uploadDesignImage = async (file: File, designNumber: string) => {
    if (!company) return null
    const fileExt = file.name.split(".").pop()
    const fileName = `${company.id}/${designNumber}-${Date.now()}.${fileExt}`
    const { error: uploadErr } = await supabase.storage
      .from("designs")
      .upload(fileName, file)
    if (uploadErr) { setError(uploadErr.message); return null }
    const { data: urlData } = supabase.storage.from("designs").getPublicUrl(fileName)
    return urlData.publicUrl
  }

  return { designs, loading, error, addDesign, updateDesign, deleteDesign, uploadDesignImage, refresh: fetchDesigns }
}
