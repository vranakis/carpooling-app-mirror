"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
} | null;

type AuthContextType = {
  user: User | null;
  profile: UserProfile;
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProfileFetchRef = useRef<string | null>(null);

  // Function to fetch profile with debouncing to prevent excessive API calls
  const fetchProfile = async (userId: string, immediate = false) => {
    // Prevent duplicate calls for the same user
    if (lastProfileFetchRef.current === userId && !immediate) {
      console.log("AuthProvider: Skipping duplicate profile fetch for:", userId);
      return;
    }

    // Clear any pending timeout
    if (profileFetchTimeoutRef.current) {
      clearTimeout(profileFetchTimeoutRef.current);
    }

    const doFetch = async () => {
      try {
        console.log("AuthProvider: Fetching profile for user:", userId);
        lastProfileFetchRef.current = userId;
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(); // Use maybeSingle() to handle cases where no profile exists

        if (error) {
          console.error(
            "AuthProvider: Error fetching profile:",
            error.message || error
          );
          return null;
        }

        console.log("AuthProvider: Profile fetched:", data);
        setProfile(data);
        return data;
      } catch (error) {
        console.error("AuthProvider: Unexpected error fetching profile:", error);
        return null;
      }
    };

    if (immediate) {
      return doFetch();
    } else {
      // Debounce profile fetching by 500ms
      profileFetchTimeoutRef.current = setTimeout(doFetch, 500);
    }
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth");

    // Check for session on mount
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        console.log(
          "AuthProvider: Initial session check:",
          currentSession?.user?.email || "No session",
          "Error:",
          error || "None"
        );

        if (error) {
          console.error(
            "AuthProvider: Session retrieval error:",
            error.message
          );
        }

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Fetch profile separately (immediate on initial load)
          fetchProfile(currentSession.user.id, true);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          console.log(
            "AuthProvider: No session found, user is not logged in or session expired"
          );
        }
      } catch (error) {
        console.error(
          "AuthProvider: Unexpected error checking session:",
          error
        );
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(
        "AuthProvider: Auth state changed:",
        event,
        newSession?.user?.email || "No session"
      );

      // Update session and user state immediately
      setSession(newSession);
      setUser(newSession?.user || null);

      // If user exists, fetch profile separately (not in this callback)
      if (newSession?.user && event !== 'TOKEN_REFRESHED') {
        // Only fetch profile on sign in, not on token refresh to avoid rate limiting
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          fetchProfile(newSession.user.id, true);
        }
      } else {
        setProfile(null);
        lastProfileFetchRef.current = null;
      }

      setIsLoading(false);
    });

    // Set up multi-tab sync using BroadcastChannel
    let authChannel: BroadcastChannel | null = null;

    try {
      authChannel = new BroadcastChannel("supabase_auth_sync");

      authChannel.onmessage = async () => {
        console.log(
          "AuthProvider: Received auth sync message from another tab"
        );
        const {
          data: { session: syncedSession },
        } = await supabase.auth.getSession();

        if (syncedSession?.user) {
          setSession(syncedSession);
          setUser(syncedSession.user);
          // Only fetch profile if we don't already have it
          if (!profile || profile.id !== syncedSession.user.id) {
            fetchProfile(syncedSession.user.id);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      };
    } catch (error) {
      console.error("AuthProvider: BroadcastChannel not supported:", error);
    }

    return () => {
      console.log("AuthProvider: Cleaning up");
      subscription.unsubscribe();
      if (authChannel) {
        authChannel.close();
      }
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
    };
  }, [supabase]);

  console.log("AuthProvider: Rendering with state:", {
    hasUser: !!user,
    userEmail: user?.email,
    hasProfile: !!profile,
    hasSession: !!session,
    isLoading,
  });

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
