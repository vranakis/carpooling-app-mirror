"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type UserProfile = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
} | null

type AuthContextType = {
  user: User | null
  profile: UserProfile
  session: Session | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Function to fetch profile - separate from auth state change
  const fetchProfile = async (userId: string) => {
    try {
      console.log("AuthProvider: Fetching profile for user:", userId)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("AuthProvider: Error fetching profile:", error)
        return null
      }

      console.log("AuthProvider: Profile fetched:", data)
      setProfile(data)
      return data
    } catch (error) {
      console.error("AuthProvider: Error fetching profile:", error)
      return null
    }
  }

  useEffect(() => {
    console.log("AuthProvider: Setting up auth")

    // Check for session on mount
    const checkSession = async () => {
      try {
        setIsLoading(true)
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        console.log("AuthProvider: Initial session check:", currentSession?.user?.email || "No session")

        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          // Fetch profile separately
          fetchProfile(currentSession.user.id)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("AuthProvider: Error checking session:", error)
        setSession(null)
        setUser(null)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("AuthProvider: Auth state changed:", event, newSession?.user?.email || "No session")

      // Update session and user state immediately
      setSession(newSession)
      setUser(newSession?.user || null)

      // If user exists, fetch profile separately (not in this callback)
      if (newSession?.user) {
        // Use setTimeout to avoid deadlocks in onAuthStateChange
        setTimeout(() => {
          fetchProfile(newSession.user.id)
        }, 0)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    // Set up multi-tab sync using BroadcastChannel
    let authChannel: BroadcastChannel | null = null

    try {
      authChannel = new BroadcastChannel("supabase_auth_sync")

      authChannel.onmessage = async () => {
        console.log("AuthProvider: Received auth sync message from another tab")
        const {
          data: { session: syncedSession },
        } = await supabase.auth.getSession()

        if (syncedSession?.user) {
          setSession(syncedSession)
          setUser(syncedSession.user)
          fetchProfile(syncedSession.user.id)
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
      }
    } catch (error) {
      console.error("AuthProvider: BroadcastChannel not supported:", error)
    }

    return () => {
      console.log("AuthProvider: Cleaning up")
      subscription.unsubscribe()
      if (authChannel) {
        authChannel.close()
      }
    }
  }, [supabase])

  console.log("AuthProvider: Rendering with state:", {
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!profile,
    hasSession: !!session,
    isLoading,
  })

  return <AuthContext.Provider value={{ user, profile, session, isLoading }}>{children}</AuthContext.Provider>
}
