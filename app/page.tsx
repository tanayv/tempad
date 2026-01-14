"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            FPL Team Timeline
          </h1>
          <p className="text-muted-foreground max-w-md">
            Enter your Fantasy Premier League team ID to view your team timeline
            and score breakdown
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="Enter Team ID"
              className="h-12 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              View Timeline
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
