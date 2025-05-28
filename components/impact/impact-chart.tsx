"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ImpactChartProps {
  data: {
    co2Saved: number
    ridesShared: number
    peopleHelped: number
    distanceShared: number
  }
  className?: string
}

export function ImpactChart({ data, className = "" }: ImpactChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#e2e8f0"
    ctx.stroke()

    // Draw bars
    const barWidth = availableWidth / 4
    const barSpacing = 20
    const maxValue = Math.max(data.co2Saved, data.ridesShared, data.peopleHelped, data.distanceShared)

    // Function to draw a bar
    const drawBar = (value: number, index: number, label: string, color: string) => {
      const barHeight = (value / maxValue) * availableHeight
      const x = padding + index * (barWidth + barSpacing)
      const y = height - padding - barHeight

      // Draw bar
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw label
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(label, x + barWidth / 2, height - padding + 20)

      // Draw value
      ctx.fillStyle = "#334155"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(value.toString(), x + barWidth / 2, y - 10)
    }

    // Draw each bar
    drawBar(data.co2Saved, 0, "CO2 Saved (kg)", "#10b981")
    drawBar(data.ridesShared, 1, "Rides", "#3b82f6")
    drawBar(data.peopleHelped, 2, "People", "#f59e0b")
    drawBar(data.distanceShared, 3, "Distance (km)", "#8b5cf6")
  }, [data])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Environmental Impact</CardTitle>
        <CardDescription>Your contribution to a greener planet</CardDescription>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} width={500} height={300} className="w-full h-auto" />
      </CardContent>
    </Card>
  )
}
