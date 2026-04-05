"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { InventoryItem, InventoryMovement, InventoryMovementInsert } from "@/lib/types/database.types"

export function useInventory() {
  const { company, appUser } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("inventory")
      .select("*")
      .eq("company_id", company.id)
    if (err) setError(err.message)
    else setInventory(data || [])
    setLoading(false)
  }, [company])

  const fetchMovements = useCallback(async (limit = 50) => {
    if (!company) return
    const { data, error: err } = await supabase
      .from("inventory_movements")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (err) setError(err.message)
    else setMovements(data || [])
  }, [company])

  useEffect(() => { fetchInventory(); fetchMovements() }, [fetchInventory, fetchMovements])

  const addMovement = async (movement: Omit<InventoryMovementInsert, "company_id" | "done_by">) => {
    if (!company || !appUser) return null
    const { data, error: err } = await supabase
      .from("inventory_movements")
      .insert({ ...movement, company_id: company.id, done_by: appUser.id })
      .select()
      .single()
    if (err) { setError(err.message); return null }

    // Update inventory current stock
    if (movement.inventory_id) {
      const item = inventory.find((i) => i.id === movement.inventory_id)
      if (item) {
        const isIn = ["stock_in", "return_in"].includes(movement.movement_type)
        await supabase
          .from("inventory")
          .update({
            current_pieces: item.current_pieces + (isIn ? movement.pieces : -movement.pieces),
            current_metres: item.current_metres + (isIn ? movement.metres : -movement.metres),
            last_updated: new Date().toISOString(),
          })
          .eq("id", item.id)
      }
    }

    await fetchInventory()
    await fetchMovements()
    return data
  }

  const lowStockItems = inventory.filter((i) => i.current_pieces <= i.minimum_stock && i.minimum_stock > 0)

  return { inventory, movements, loading, error, addMovement, lowStockItems, refresh: () => { fetchInventory(); fetchMovements() } }
}
