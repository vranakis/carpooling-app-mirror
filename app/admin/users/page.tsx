"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { manuallyConfirmEmail } from "@/lib/actions/auth"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data: users, error } = await supabase.from("users").select("*")

        if (error) {
          throw error
        }

        setUsers(users || [])
      } catch (error: any) {
        console.error("Error fetching users:", error.message)
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleConfirmUser = async (userId: string) => {
    try {
      const result = await manuallyConfirmEmail(userId)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success("User email confirmed successfully")

      // Update the local state to reflect the change
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, email_confirmed_at: new Date().toISOString() } : user)),
      )
    } catch (error: any) {
      console.error("Error confirming user:", error.message)
      toast.error("Failed to confirm user email")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and email confirmations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.email_confirmed_at ? (
                        <span className="text-green-500">Confirmed</span>
                      ) : (
                        <span className="text-amber-500">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!user.email_confirmed_at && (
                        <Button variant="outline" size="sm" onClick={() => handleConfirmUser(user.id)}>
                          Confirm Email
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
