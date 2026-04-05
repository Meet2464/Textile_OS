"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { Order, OrderInsert, OrderLine, OrderLineInsert } from "@/lib/types/database.types"

export interface OrderWithLines extends Order {
  order_lines: OrderLine[]
}

export function useOrders() {
  const { company, appUser } = useAuth()
  const [orders, setOrders] = useState<OrderWithLines[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("orders")
      .select("*, order_lines(*)")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })

    if (err) setError(err.message)
    else setOrders((data as unknown as OrderWithLines[]) || [])
    setLoading(false)
  }, [company])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const addOrder = async (
    order: Omit<OrderInsert, "company_id" | "po_number" | "created_by">,
    lines: Omit<OrderLineInsert, "order_id">[]
  ) => {
    if (!company || !appUser) return null

    // Get next PO number
    const { data: poNum, error: counterErr } = await supabase.rpc("get_next_counter", {
      p_company_id: company.id,
      p_type: "po_number",
    })
    if (counterErr) { setError(counterErr.message); return null }

    // Create order
    const { data: newOrder, error: orderErr } = await supabase
      .from("orders")
      .insert({
        ...order,
        company_id: company.id,
        po_number: poNum,
        created_by: appUser.id,
      })
      .select()
      .single()

    if (orderErr) { setError(orderErr.message); return null }

    // Create order lines
    if (lines.length > 0) {
      const orderLines = lines.map((line, idx) => ({
        ...line,
        order_id: newOrder.id,
        line_number: idx + 1,
      }))
      await supabase.from("order_lines").insert(orderLines)
    }

    await fetchOrders()
    return newOrder
  }

  const updateOrder = async (id: string, updates: Partial<OrderInsert>) => {
    const { data, error: err } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (err) { setError(err.message); return null }
    await fetchOrders()
    return data
  }

  const deleteOrder = async (id: string) => {
    const { error: err } = await supabase.from("orders").delete().eq("id", id)
    if (err) { setError(err.message); return false }
    setOrders((prev) => prev.filter((o) => o.id !== id))
    return true
  }

  return { orders, loading, error, addOrder, updateOrder, deleteOrder, refresh: fetchOrders }
}
