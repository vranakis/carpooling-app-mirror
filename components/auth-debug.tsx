"use client"

import { useAuth } from "./auth-provider"

export default function AuthDebug() {
  const { user, profile, session, isLoading } = useAuth()

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Loading: {isLoading ? "Yes" : "No"}</div>
      <div>Session: {session ? "Yes" : "None"}</div>
      <div>User: {user?.email || "None"}</div>
      <div>Profile: {profile?.first_name || "None"}</div>
      <div>User ID: {user?.id || "None"}</div>
      {session && (
        <div className="mt-2 text-xs opacity-75">
          <div>Access Token: {session.access_token ? "Present" : "Missing"}</div>
          <div>Refresh Token: {session.refresh_token ? "Present" : "Missing"}</div>
          <div>Expires: {new Date(session.expires_at! * 1000).toLocaleTimeString()}</div>
        </div>
      )}
      {user && !session && <div className="mt-2 text-xs text-yellow-400">Warning: User exists but no session!</div>}
    </div>
  )
}
