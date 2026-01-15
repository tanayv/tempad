"use client"

import { AlternateTimeline } from "@/lib/fpl/operations/calculateAlternateTimelines"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts"

interface AlternateTimelineChartProps {
  timeline: AlternateTimeline
}

export function AlternateTimelineChart({ timeline }: AlternateTimelineChartProps) {

  // Create a combined dataset for the chart using cumulative scores
  const allGameweeks = Array.from(
    new Set(timeline.mainBranch.map((point) => point.gameweek))
  ).sort((a, b) => a - b)

  // Track termination state for each branch across all gameweeks
  const branchTerminationState: { [branchId: number]: { markedForTermination: number | null, terminated: boolean } } = {}

  // Transform data for recharts - branches only start from their origin gameweek and terminate with delayed termination logic
  const chartData = allGameweeks.map((gw) => {
    const dataPoint: any = { gameweek: gw }

    // Add main branch cumulative score
    const mainScore = timeline.mainBranch.find((point) => point.gameweek === gw)
    if (mainScore) {
      dataPoint.main = mainScore.cumulativeScore
    }

    // Add each branch's cumulative score only from their origin gameweek onwards,
    // with delayed termination logic
    timeline.branches.forEach((branch) => {
      // Only add data points from the origin gameweek onwards
      if (gw >= branch.originGameweek) {
        const branchScore = branch.scores.find((score) => score.gameweek === gw)
        if (branchScore && mainScore) {
          // Initialize termination state if not exists
          if (!branchTerminationState[branch.branchId]) {
            branchTerminationState[branch.branchId] = { markedForTermination: null, terminated: false }
          }

          const pointsGap = mainScore.cumulativeScore - branchScore.cumulativeScore
          const state = branchTerminationState[branch.branchId]

          // Check if branch should be marked for termination
          if (pointsGap >= 25 && state.markedForTermination === null) {
            state.markedForTermination = gw
          }
          // Check if gap has closed and branch should be unmarked
          else if (pointsGap < 25 && state.markedForTermination !== null) {
            state.markedForTermination = null
          }

          // Check if branch should be terminated (6 gameweeks after being marked)
          if (state.markedForTermination !== null && gw >= state.markedForTermination + 6) {
            state.terminated = true
          }

          // Add data point if not terminated
          if (!state.terminated) {
            dataPoint[`branch_${branch.branchId}`] = branchScore.cumulativeScore
          }
        }
      }
    })

    return dataPoint
  })

  // Custom tooltip to show branch info on hover
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md p-3 shadow-lg dark:bg-[#1a0f0a] dark:border-[#8b4513]">
          <p className="font-semibold mb-2 dark:text-[#ff9966]">Gameweek {label}</p>
          {payload.map((entry: any, index: number) => {
            const isMain = entry.dataKey === "main"
            const branchId = isMain ? null : parseInt(entry.dataKey.replace("branch_", ""))
            const branch = branchId !== null ? timeline.branches[branchId] : null

            return (
              <div key={index} className="text-sm dark:text-[#cc7744]">
                <span className="font-medium">
                  {isMain ? "Actual Team" : `GW${branch?.originGameweek} Team (Frozen)`}:
                </span>{" "}
                <span className="font-bold dark:text-[#ff9966]">{entry.value} pts</span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full dark:bg-[#1a0f0a] dark:border-[#8b4513]">
      <CardHeader className="dark:border-b dark:border-[#8b4513]">
        <CardTitle className="dark:text-[#ff9966] font-mono">ALTERNATE TIMELINE ANALYSIS</CardTitle>
        <CardDescription className="dark:text-[#cc7744] font-mono mb-4">
          Cumulative scores showing what would have happened if you froze your team at each gameweek
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#cc7744"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="gameweek"
              label={{
                value: "Gameweek",
                position: "insideBottom",
                offset: -5,
                className: "dark:fill-[#cc7744]"
              }}
              stroke="#888"
              className="dark:stroke-[#cc7744]"
              tick={{ className: "dark:fill-[#cc7744]" }}
            />
            <YAxis
              label={{
                value: "Cumulative Points",
                angle: -90,
                position: "insideLeft",
                className: "dark:fill-[#cc7744]"
              }}
              stroke="#888"
              className="dark:stroke-[#cc7744]"
              tick={{ className: "dark:fill-[#cc7744]" }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Alternate branches - yellow/orange lines same thickness starting from origin */}
            {timeline.branches.map((branch) => (
              <Line
                key={`branch_${branch.branchId}`}
                type="monotone"
                dataKey={`branch_${branch.branchId}`}
                stroke="#ffaa44"
                className="stroke-gray-500 dark:stroke-[#ffaa44]"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                connectNulls={false}
              />
            ))}

            {/* Main branch - thick line (black in light mode, white in dark mode) */}
            <Line
              type="monotone"
              dataKey="main"
              stroke="currentColor"
              className="stroke-black dark:stroke-white"
              strokeWidth={4}
              dot={false}
              activeDot={true}
            />
            
          </LineChart>
        </ResponsiveContainer>

        {/* Summary table */}
        <div>
          <h3 className="text-sm font-semibold mb-3 dark:text-[#ff9966] font-mono">TOTAL POINTS SUMMARY</h3>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-[#8b4513]">
                <TableHead className="dark:text-[#cc7744] font-mono">Team</TableHead>
                <TableHead className="text-right dark:text-[#cc7744] font-mono">Total Points</TableHead>
                <TableHead className="text-right dark:text-[#cc7744] font-mono">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Main branch */}
              <TableRow className="font-semibold bg-muted/50 dark:bg-[#2a1f1a] dark:border-[#8b4513]">
                <TableCell className="dark:text-[#ff9966] font-mono">Actual Team (with transfers)</TableCell>
                <TableCell className="text-right dark:text-[#ff9966] font-mono">{timeline.mainTotalPoints}</TableCell>
                <TableCell className="text-right dark:text-[#cc7744] font-mono">-</TableCell>
              </TableRow>

              {/* Alternate branches sorted by total points descending */}
              {timeline.branches
                .slice()
                .sort((a, b) => b.totalPointsToDate - a.totalPointsToDate)
                .map((branch) => {
                  const diff = timeline.mainTotalPoints - branch.totalPointsToDate
                  return (
                    <TableRow key={branch.branchId} className="dark:border-[#8b4513]">
                      <TableCell className="dark:text-[#cc7744] font-mono">GW{branch.originGameweek} Team (Frozen)</TableCell>
                      <TableCell className="text-right dark:text-[#cc7744] font-mono">{branch.totalPointsToDate}</TableCell>
                      <TableCell className={`text-right font-mono ${diff > 0 ? 'text-green-600 dark:text-green-400' : diff < 0 ? 'text-red-600 dark:text-red-400' : 'dark:text-[#cc7744]'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
