"use client";

// TEMPORARY AUTH PROVIDER
// This is a placeholder until we add Clerk authentication
// TODO: Replace with Clerk after database is working

import type React from "react";
import { createContext, useContext, useState } from "react";

type User = {
  id: string;
  email: string;
} | null;

type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
} | null;

type AuthContextType = {
  user: User;
  profile: UserProfile;
  session: any;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: false,
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
  // Dummy state - no real authentication yet
  const [user] = useState<User>(null);
  const [profile] = useState<UserProfile>(null);
  const [session] = useState(null);
  const [isLoading] = useState(false);

  console.log("🔓 AuthProvider: No authentication (temporary)");

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// NOTE: This is a temporary placeholder!
// When we add Clerk, we'll replace this with proper authentication
