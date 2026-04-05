"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User as AppUser, Company } from "@/lib/types/database.types"
import type { User as AuthUser, Session } from "@supabase/supabase-js"

interface AuthState {
  authUser: AuthUser | null
  appUser: AppUser | null
  company: Company | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ success: boolean; data?: { user: AuthUser | null }; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    authUser: null,
    appUser: null,
    company: null,
    session: null,
    loading: true,
    error: null,
  })

  // To prevent the annoying full page reload when switching tabs 
  // (Supabase fires SIGNED_IN repeatedly on visibility change), we track the current user.
  const currentUserId = useRef<string | null>(null)

  // Fetch the app user profile and company from our database
  const fetchUserProfile = useCallback(async (authUser: AuthUser) => {
    try {
      const { data: appUserData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.id)
        .single()

      if (userError && userError.code !== "PGRST116") {
        console.error("Error fetching user profile:", userError)
        return
      }

      const appUser = appUserData as AppUser | null

      if (appUser && appUser.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("*")
          .eq("id", appUser.company_id)
          .single()
        
        const company = companyData as Company | null

        currentUserId.current = appUser.auth_id

        setState((prev) => ({
          ...prev,
          appUser,
          company,
          loading: false,
          error: null,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          appUser: appUser || null,
          company: null,
          loading: false,
          error: null,
        }))
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err)
      setState((prev) => ({ ...prev, loading: false, error: "Failed to load profile" }))
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setState((prev) => ({ ...prev, authUser: session.user, session }))
        await fetchUserProfile(session.user)
      } else {
        setState((prev) => ({ ...prev, loading: false }))
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If we are already signed in as the identical user, just silently update session
      if (event === "SIGNED_IN" && session?.user && currentUserId.current === session.user.id) {
        setState((prev) => ({ ...prev, authUser: session.user, session }))
        return
      }

      if (event === "SIGNED_IN" && session?.user) {
        setState((prev) => ({
          ...prev,
          authUser: session.user,
          session,
          loading: true,
        }))
        await fetchUserProfile(session.user)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Silently update session — do NOT set loading:true or re-fetch profile
        // This prevents the full page reload when browser tab regains focus
        setState((prev) => ({
          ...prev,
          authUser: session.user,
          session,
        }))
      } else if (event === "SIGNED_OUT") {
        currentUserId.current = null
        setState({
          authUser: null,
          appUser: null,
          company: null,
          session: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      return { success: false, error: error.message }
    }
    // If identities is empty, Supabase requires email confirmation
    // The user exists in auth but hasn't confirmed their email yet
    if (data?.user && data.user.identities?.length === 0) {
      return { success: false, error: 'This email is already registered. Please check your inbox or try logging in.' }
    }
    return { success: true, data }
  }

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      // Map Supabase error messages to user-friendly ones
      let msg = error.message
      if (msg === 'Invalid login credentials') msg = 'Incorrect email or password.'
      if (msg === 'Email not confirmed') msg = 'Your email is not confirmed. Please check your inbox for a verification link, or register again.'
      setState((prev) => ({ ...prev, loading: false, error: msg }))
      return { success: false, error: msg }
    }
    return { success: true }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshUser = async () => {
    // Always get the current session from Supabase directly
    // to avoid stale closure issues with state.authUser
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
