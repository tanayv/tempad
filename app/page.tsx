"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [teamId, setTeamId] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (teamId.trim()) {
      router.push(`/${teamId}/timeline`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background dark:bg-[#0d0a08]">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="flex flex-col items-center gap-8 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight dark:text-[#ff9966] font-mono">
            FPL TEMPAD
          </h1>
          <p className="text-muted-foreground dark:text-[#cc7744] max-w-md">
            Enter your Fantasy Premier League team ID to view your team timeline
            and alternate reality analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Enter Team ID"
              className="h-12 px-4 rounded-lg border border-input bg-background dark:bg-[#1a0f0a] dark:border-[#8b4513] text-foreground dark:text-[#ff9966] placeholder:text-muted-foreground dark:placeholder:text-[#8b6f47] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-[#ff9966] focus:ring-offset-2 font-mono"
              required
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-lg bg-primary dark:bg-[#ff9966] text-primary-foreground dark:text-[#1a0f0a] font-medium hover:bg-primary/90 dark:hover:bg-[#cc7744] transition-colors font-mono"
            >
              VIEW TIMELINE
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
