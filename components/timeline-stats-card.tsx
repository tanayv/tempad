"use client"

import { AlternateTimeline } from "@/lib/fpl/operations/calculateAlternateTimelines"
import { TeamScoreData } from "@/lib/fpl/operations/calculateTeamScores"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

interface TimelineStatsCardProps {
  timeline: AlternateTimeline
  teamScoreData: TeamScoreData[]
}

export function TimelineStatsCard({ timeline, teamScoreData }: TimelineStatsCardProps) {
  // Calculate transfer statistics
  const transferStats = teamScoreData.reduce((acc, gameweekData) => {
    gameweekData.transferEffectiveness.forEach(transfer => {
      if (transfer.rating.label === "Masterclass") {
        acc.masterclasses++
        acc.goodTransfers++
      } else if (transfer.rating.label === "Good choice") {
        acc.goodTransfers++
      } else if (transfer.rating.label === "Bad choice") {
        acc.badTransfers++
      } else if (transfer.rating.label === "Disasterclass") {
        acc.disasterclasses++
        acc.badTransfers++
      }
    })
    return acc
  }, { goodTransfers: 0, masterclasses: 0, badTransfers: 0, disasterclasses: 0 })

  // Find best and worst branches with their gameweeks
  const bestBranch = timeline.branches.reduce((best, branch) =>
    branch.totalPointsToDate > best.totalPointsToDate ? branch : best
  )
  const worstBranch = timeline.branches.reduce((worst, branch) =>
    branch.totalPointsToDate < worst.totalPointsToDate ? branch : worst
  )

  const vsBestDiff = timeline.mainTotalPoints - bestBranch.totalPointsToDate

  // Calculate number of gameweeks for threshold comparison
  const numGameweeks = teamScoreData.length

  // Determine border colors based on performance
  const goodTransfersBorder = transferStats.goodTransfers > numGameweeks
    ? 'border-green-500' : 'border-gray-300 dark:border-[#8b4513]'
  const masterclassesBorder = transferStats.masterclasses > 0
    ? 'border-purple-500' : 'border-gray-300 dark:border-[#8b4513]'
  const badTransfersBorder = transferStats.badTransfers > numGameweeks
    ? 'border-red-500' : 'border-gray-300 dark:border-[#8b4513]'
  const disasterclassesBorder = transferStats.disasterclasses > 0
    ? 'border-red-800' : 'border-gray-300 dark:border-[#8b4513]'
  const vsBestBorder = vsBestDiff < 0 ? 'border-red-500'
    : vsBestDiff > 0 ? 'border-green-500' : 'border-gray-300 dark:border-[#8b4513]'

  return (
    <Card className="w-full bg-white dark:bg-[#1a0f0a] border-gray-200 dark:border-[#8b4513] relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(204, 119, 68, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(204, 119, 68, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      <CardContent className="relative p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* Good Transfers */}
          <div className={`border-r border-b ${goodTransfersBorder} bg-white/80 dark:bg-[#1a0f0a]/80 backdrop-blur-sm p-6 text-center rounded-sm`}>
            <div className="text-3xl font-bold text-gray-900 dark:text-[#ff9966] mb-2 font-mono">
              {transferStats.goodTransfers}
            </div>
            <div className="text-xs text-gray-600 dark:text-[#cc7744] uppercase tracking-wider font-mono">
              GOOD<br />TRANSFERS
            </div>
          </div>

          {/* Masterclasses */}
          <div className={`border-r border-b ${masterclassesBorder} bg-white/80 dark:bg-[#1a0f0a]/80 backdrop-blur-sm p-6 text-center rounded-sm`}>
            <div className="text-3xl font-bold text-gray-900 dark:text-[#ff9966] mb-2 font-mono">
              {transferStats.masterclasses}
            </div>
            <div className="text-xs text-gray-600 dark:text-[#cc7744] uppercase tracking-wider font-mono">
              MASTER<br />CLASSES
            </div>
          </div>

          {/* Bad Transfers */}
          <div className={`border-r border-b ${badTransfersBorder} bg-white/80 dark:bg-[#1a0f0a]/80 backdrop-blur-sm p-6 text-center rounded-sm`}>
            <div className="text-3xl font-bold text-gray-900 dark:text-[#ff9966] mb-2 font-mono">
              {transferStats.badTransfers}
            </div>
            <div className="text-xs text-gray-600 dark:text-[#cc7744] uppercase tracking-wider font-mono">
              BAD<br />TRANSFERS
            </div>
          </div>

          {/* Disasterclasses */}
          <div className={`border-r border-b ${disasterclassesBorder} bg-white/80 dark:bg-[#1a0f0a]/80 backdrop-blur-sm p-6 text-center rounded-sm`}>
            <div className="text-3xl font-bold text-gray-900 dark:text-[#ff9966] mb-2 font-mono">
              {transferStats.disasterclasses}
            </div>
            <div className="text-xs text-gray-600 dark:text-[#cc7744] uppercase tracking-wider font-mono">
              DISASTER<br />CLASSES
            </div>
          </div>

          {/* Peak Alt Timeline */}
          <div className="border-r border-b border-gray-300 dark:border-[#8b4513] bg-white/80 dark:bg-[#1a0f0a]/80 backdrop-blur-sm p-6 text-center rounded-sm">
            <div className="text-3xl font-bold text-gray-900 dark:text-[#ff9966] mb-2 font-mono">
              {bestBranch.totalPointsToDate}
            </div>
            <div className="text-xs text-gray-600 dark:text-[#cc7744] uppercase tracking-wider font-mono">
              PEAK ALT<br />(GW{bestBranch.originGameweek})
            </div>
          </div>

          {/* Worst Alt Timeline */}
          <div className="border-r border-b border-gray-300 dark:border-[#8b4513] bg-white/80 dark:bg-[#1a0f0a]/80 backdrop-blur-sm p-6 text-center rounded-sm">
            <div className="text-3xl font-bold text-gray-900 dark:text-[#ff9966] mb-2 font-mono">
              {worstBranch.totalPointsToDate}
            </div>
            <div className="text-xs text-gray-600 dark:text-[#cc7744] uppercase tracking-wider font-mono">
              WORST ALT<br />(GW{worstBranch.originGameweek})
            </div>
          </div>

          {/* VS Best Branch */}
          <div className={`border-r border-b ${vsBestBorder} bg-white/80 dark:bg-[#1a0f0a]/80 backdrop-blur-sm p-6 text-center rounded-sm`}>
            <div className="text-3xl font-bold text-gray-900 dark:text-[#ff9966] mb-2 font-mono">
              {vsBestDiff >= 0 ? '+' : ''}{vsBestDiff}
            </div>
            <div className="text-xs text-gray-600 dark:text-[#cc7744] uppercase tracking-wider font-mono">
              VS BEST<br />(GW{bestBranch.originGameweek})
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}