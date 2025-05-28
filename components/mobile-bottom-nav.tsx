"use client"

import { Car, Search, User, Calendar, MessageSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const isMobile = useMobile()

  const navItems = [
    {
      label: "Find",
      href: "/",
      icon: Search,
      active: pathname === "/" || pathname.startsWith("/search") || pathname.startsWith("/ride/"),
    },
    {
      label: "My Rides",
      href: "/my-rides",
      icon: Calendar,
      active: pathname === "/my-rides" || pathname.startsWith("/manage-booking/"),
    },
    {
      label: "Share",
      href: "/offer-ride",
      icon: Car,
      active: pathname === "/offer-ride",
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      active: pathname.startsWith("/messages"),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      active: pathname.startsWith("/profile"),
    },
  ]

  if (!isMobile) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 flex-1 text-xs",
              item.active ? "text-emerald-600" : "text-gray-500",
            )}
          >
            <item.icon className={cn("h-5 w-5 mb-1", item.active ? "text-emerald-600" : "text-gray-500")} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
