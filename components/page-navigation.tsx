"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface PageNavigationProps {
  managerId: string
}

export function PageNavigation({ managerId }: PageNavigationProps) {
  const pathname = usePathname()
  const isTimeline = pathname.includes('/timeline')
  const isPerformance = pathname.includes('/performance')

  return (
    <div className="flex space-x-1 bg-black/20 dark:bg-[#1a0f0a] p-1 rounded-lg border dark:border-[#8b4513] w-fit">
      <Link
        href={`/${managerId}/timeline`}
        className={`py-3 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
          isTimeline
            ? "bg-[#ff9966] text-[#1a0f0a] shadow-sm"
            : "text-muted-foreground hover:text-[#ff9966] hover:bg-[#ff9966]/10"
        }`}
      >
        Timeline
      </Link>
      <Link
        href={`/${managerId}/performance`}
        className={`py-3 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
          isPerformance
            ? "bg-[#ff9966] text-[#1a0f0a] shadow-sm"
            : "text-muted-foreground hover:text-[#ff9966] hover:bg-[#ff9966]/10"
        }`}
      >
        Performance
      </Link>
    </div>
  )
}