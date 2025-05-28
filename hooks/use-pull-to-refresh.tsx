"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  pullDownThreshold?: number
  distanceToRefresh?: number
}

export function usePullToRefresh({
  onRefresh,
  pullDownThreshold = 80,
  distanceToRefresh = 60,
}: UsePullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isActive = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only activate pull-to-refresh when at the top of the page
    if (window.scrollY <= 0) {
      isActive.current = true
      startY.current = e.touches[0].clientY
      currentY.current = startY.current
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isActive.current) return

      currentY.current = e.touches[0].clientY
      const distance = currentY.current - startY.current

      // Only allow pulling down, not up
      if (distance > 0) {
        // Apply resistance to make the pull feel natural
        const newDistance = Math.min(distance * 0.4, pullDownThreshold)
        setPullDistance(newDistance)

        // Prevent default scrolling behavior when pulling
        if (distance > 10) {
          e.preventDefault()
        }
      } else {
        setPullDistance(0)
      }
    },
    [pullDownThreshold],
  )

  const handleTouchEnd = useCallback(async () => {
    if (!isActive.current) return

    isActive.current = false
    setIsPulling(false)

    // If pulled far enough, trigger refresh
    if (pullDistance >= distanceToRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (error) {
        console.error("Refresh failed:", error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Reset pull distance
    setPullDistance(0)
  }, [distanceToRefresh, onRefresh, pullDistance])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add event listeners
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    // Clean up
    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    containerRef,
    pullDistance,
    isPulling,
    isRefreshing,
  }
}
