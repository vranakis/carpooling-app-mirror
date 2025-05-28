"use client"

import { InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CostSharingInfo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex items-center">
          <span>Suggested contribution</span>
          <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            This is a suggested amount to help cover fuel and vehicle costs. All payments are handled directly between
            riders and drivers outside the app. RideShare does not process any payments.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
