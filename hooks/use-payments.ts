"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type {
  OrderPayment, PaymentTransaction, PaymentTransactionInsert,
  WorkerPayment, WorkerPaymentInsert
} from "@/lib/types/database.types"

export function useOrderPayments() {
  const { company, appUser } = useAuth()
  const [payments, setPayments] = useState<OrderPayment[]>([])
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("order_payments")
      .select("*")
      .eq("company_id", company.id)
      .order("payment_due_date", { ascending: true })
    if (err) setError(err.message)
    else setPayments((data as unknown as OrderPayment[]) || [])
    setLoading(false)
  }, [company])

  const fetchTransactions = useCallback(async () => {
    if (!company) return
    const { data, error: err } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("company_id", company.id)
      .order("payment_date", { ascending: false })
    if (err) setError(err.message)
    else setTransactions((data as unknown as PaymentTransaction[]) || [])
  }, [company])

  useEffect(() => { fetchPayments(); fetchTransactions() }, [fetchPayments, fetchTransactions])

  const recordTransaction = async (txn: Omit<PaymentTransactionInsert, "company_id" | "received_by">) => {
    if (!company || !appUser) return null
    const { data, error: err } = await supabase
      .from("payment_transactions")
      .insert({ ...txn, company_id: company.id, received_by: appUser.id })
      .select()
      .single()
    if (err) { setError(err.message); return null }

    // Update order payment balance
    if (txn.order_payment_id) {
      const payment = payments.find((p) => p.id === txn.order_payment_id)
      if (payment) {
        const newBalance = payment.balance_due - txn.amount
        await supabase
          .from("order_payments")
          .update({
            balance_due: newBalance,
            advance_paid: payment.advance_paid + txn.amount,
            payment_status: newBalance <= 0 ? "fully_paid" : "partial",
            last_payment_date: txn.payment_date,
          })
          .eq("id", payment.id)
      }
    }

    await fetchPayments()
    await fetchTransactions()
    return data
  }

  const totalReceivable = payments.reduce((sum, p) => sum + p.balance_due, 0)

  return { payments, transactions, loading, error, recordTransaction, totalReceivable, refresh: () => { fetchPayments(); fetchTransactions() } }
}

export function useWorkerPayments() {
  const { company, appUser } = useAuth()
  const [payments, setPayments] = useState<WorkerPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!company) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from("worker_payments")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
    if (err) setError(err.message)
    else setPayments((data as unknown as WorkerPayment[]) || [])
    setLoading(false)
  }, [company])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const recordPayment = async (payment: Omit<WorkerPaymentInsert, "company_id" | "paid_by">) => {
    if (!company || !appUser) return null
    const { data, error: err } = await supabase
      .from("worker_payments")
      .insert({ ...payment, company_id: company.id, paid_by: appUser.id })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setPayments((prev) => [data as unknown as WorkerPayment, ...prev])
    return data
  }

  const totalPayable = payments.filter((p) => p.payment_status === "unpaid").reduce((sum, p) => sum + p.total_amount, 0)

  return { payments, loading, error, recordPayment, totalPayable, refresh: fetchPayments }
}
