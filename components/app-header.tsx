"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, MessageSquare, User, LogOut, Leaf } from "lucide-react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      "U"
    : "U";

  if (!isLoaded) {
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
    );
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
                pathname === "/search"
                  ? "text-emerald-600 font-medium"
                  : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Find a Ride
            </Link>
            {user && (
              <Link
                href="/offer-ride"
                className={`text-sm ${
                  pathname === "/offer-ride"
                    ? "text-emerald-600 font-medium"
                    : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Offer a Ride
              </Link>
            )}
            {user && (
              <Link
                href="/impact"
                className={`text-sm flex items-center gap-1 ${
                  pathname === "/impact"
                    ? "text-emerald-600 font-medium"
                    : "text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Leaf className="h-4 w-4" />
                Impact
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/messages"
                  className="text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  href="/notifications"
                  className="text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                {/* Clerk's UserButton - handles profile, settings, and sign out */}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="My Rides"
                      labelIcon={<User className="h-4 w-4" />}
                      href="/my-rides"
                    />
                    <UserButton.Link
                      label="My Bookings"
                      labelIcon={<User className="h-4 w-4" />}
                      href="/my-bookings"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost">Log in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    Sign up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
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
                  pathname === "/search"
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Ride
              </Link>
              {user && (
                <Link
                  href="/offer-ride"
                  className={`px-4 py-2 rounded-md ${
                    pathname === "/offer-ride"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
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
                    pathname === "/impact"
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
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
                  <div className="px-4 py-2">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          rootBox: "w-full",
                          avatarBox: "h-10 w-10",
                        },
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                      Sign up
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
