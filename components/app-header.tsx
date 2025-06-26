"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, MessageSquare, User, LogOut, Leaf } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import { useAuth } from "./auth-provider"

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, isLoading } = useAuth()

  const userInitials = profile ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() : "U"

  if (isLoading) {
    return (
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-emerald-600">
                RideShare
              </Link>
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

    return (
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-emerald-600">
              RideShare
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/search"
              className={`text-sm ${
                pathname === "/search" ? "text-emerald-600 font-medium" : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Find a Ride
            </Link>
            {user && (
              <Link
                href="/offer-ride"
                className={`text-sm ${
                  pathname === "/offer-ride" ? "text-emerald-600 font-medium" : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Offer a Ride
              </Link>
            )}
            {user && (
              <Link
                href="/impact"
                className={`text-sm flex items-center gap-1 ${
                  pathname === "/impact" ? "text-emerald-600 font-medium" : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Leaf className="h-4 w-4" />
                Impact
              </Link>
            )}
            {user ? (
              <>
                <Link href="/messages" className="text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200">
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link href="/notifications" className="text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200">
                  <Bell className="h-5 w-5" />
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={profile?.avatar_url || "/placeholder.svg?height=32&width=32&query=avatar"}
                          alt={userInitials}
                        />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-rides" className="w-full">
                        My Rides
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-bookings" className="w-full">
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/search"
                className={`px-4 py-2 rounded-md ${
                  pathname === "/search" ? "bg-emerald-50 text-emerald-600" : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Ride
              </Link>
              {user && (
                <Link
                  href="/offer-ride"
                  className={`px-4 py-2 rounded-md ${
                    pathname === "/offer-ride" ? "bg-emerald-50 text-emerald-600" : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Offer a Ride
                </Link>
              )}
              {user && (
                <Link
                  href="/impact"
                  className={`px-4 py-2 rounded-md flex items-center ${
                    pathname === "/impact" ? "bg-emerald-50 text-emerald-600" : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  Environmental Impact
                </Link>
              )}
              {user ? (
                <>
                  <Link
                    href="/messages"
                    className="px-4 py-2 rounded-md text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Messages
                  </Link>
                  <Link
                    href="/notifications"
                    className="px-4 py-2 rounded-md text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-2 rounded-md text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/my-rides"
                    className="px-4 py-2 rounded-md text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Rides
                  </Link>
                  <Link
                    href="/my-bookings"
                    className="px-4 py-2 rounded-md text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      signOut()
                    }}
                    className="px-4 py-2 rounded-md text-red-600 hover:bg-red-50 flex items-center text-left w-full"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Sign up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
