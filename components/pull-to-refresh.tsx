"use client"

import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { Loader2 } from "lucide-react"
import type { ReactNode } from "react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { containerRef, pullDistance, isPulling, isRefreshing } = usePullToRefresh({
    onRefresh,
  })

  return (
    <div ref={containerRef} className="relative min-h-full">
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center transition-transform duration-200 z-10"
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: Math.min(pullDistance / 60, 1),
        }}
      >
        <div className="bg-emerald-100 text-emerald-700 rounded-full p-2 shadow-md">
          <Loader2 className={`h-6 w-6 ${isRefreshing ? "animate-spin" : isPulling ? "animate-pulse" : ""}`} />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}
