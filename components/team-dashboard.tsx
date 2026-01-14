"use client"

import { TeamScoreData } from "@/lib/fpl/operations/calculateTeamScores"
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
import { Badge } from "@/components/ui/badge"

interface TeamDashboardProps {
  gameweekTeams: TeamScoreData[]
}

export function TeamDashboard({ gameweekTeams }: TeamDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight dark:text-[#ff9966]">FPL Team Timeline</h1>
        <p className="text-muted-foreground dark:text-[#cc7744]">
          View your team composition and transfers across all gameweeks
        </p>
      </div>

      {gameweekTeams.map((gameweekTeam) => {
        // Create a map of player scores for quick lookup
        const playerScoreMap = new Map(
          gameweekTeam.playerScores.map((ps) => [ps.playerId, ps])
        )

        // Calculate net points from transfers
        const transferNetPoints = gameweekTeam.transferEffectiveness.reduce(
          (sum, effectiveness) => sum + effectiveness.diff,
          0
        ) + (gameweekTeam.captainChangeEffectiveness?.diff ?? 0)

        return (
          <Card key={gameweekTeam.gameweek} className="dark:bg-[#1a0f0a] dark:border-[#8b4513]">
            <CardHeader className="dark:border-b dark:border-[#8b4513]">
              <div className="flex items-center justify-between">
                <CardTitle className="dark:text-[#ff9966] font-mono">Gameweek {gameweekTeam.gameweek}</CardTitle>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="default" className="text-lg px-4 py-1 dark:bg-[#ff9966] dark:text-[#1a0f0a] font-mono">
                    Total: {gameweekTeam.totalScore} pts
                  </Badge>
                  {(gameweekTeam.transfers.length > 0 || gameweekTeam.captainChangeEffectiveness) && (
                    <Badge
                      variant="secondary"
                      className={`text-xs px-3 py-0.5 font-mono ${transferNetPoints >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}
                    >
                      Transfer net: {transferNetPoints >= 0 ? '+' : ''}{transferNetPoints} pts
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="dark:text-[#cc7744]">
                <div className="mt-2 space-y-3">
                  {/* Transfer Effectiveness */}
                  {gameweekTeam.transfers.length > 0 ? (
                    <div className="space-y-2">
                      <p className="font-medium text-sm dark:text-[#ff9966] font-mono">Transfers:</p>
                      {gameweekTeam.transferEffectiveness.map((effectiveness, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-mono">
                            <Badge variant="destructive" className="text-xs font-mono dark:bg-red-900/50 dark:text-red-400">
                              OUT
                            </Badge>
                            <span className="dark:text-[#cc7744]">{effectiveness.transfer.elementOutName}</span>
                            <span className="text-muted-foreground text-xs dark:text-[#8b6f47]">
                              ({effectiveness.transferredOutPoints} pts)
                            </span>
                            <span className="text-muted-foreground dark:text-[#cc7744]">→</span>
                            <Badge variant="default" className="text-xs font-mono dark:bg-green-900/50 dark:text-green-400">
                              IN
                            </Badge>
                            <span className="dark:text-[#cc7744]">{effectiveness.transfer.elementInName}</span>
                            <span className="text-muted-foreground text-xs dark:text-[#8b6f47]">
                              ({effectiveness.transferredInPoints} pts)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-1">
                            <Badge
                              className={`text-xs font-mono ${effectiveness.rating.colorClass}`}
                            >
                              {effectiveness.diff >= 0 ? "+" : ""}
                              {effectiveness.diff} pts
                            </Badge>
                            <span className="text-xs text-muted-foreground dark:text-[#8b6f47] font-mono">
                              {effectiveness.rating.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm">No transfers made</span>
                  )}

                  {/* Captain Change Effectiveness */}
                  {gameweekTeam.captainChangeEffectiveness && (
                    <div className="space-y-2 pt-2 border-t dark:border-[#8b4513]">
                      <p className="font-medium text-sm dark:text-[#ff9966] font-mono">Captain Change:</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary" className="text-xs">
                            OLD (C)
                          </Badge>
                          <span>{gameweekTeam.captainChangeEffectiveness.previousCaptainName}</span>
                          <span className="text-muted-foreground text-xs">
                            ({gameweekTeam.captainChangeEffectiveness.previousCaptainContribution} pts)
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="default" className="text-xs">
                            NEW (C)
                          </Badge>
                          <span>{gameweekTeam.captainChangeEffectiveness.currentCaptainName}</span>
                          <span className="text-muted-foreground text-xs">
                            ({gameweekTeam.captainChangeEffectiveness.currentCaptainContribution} pts)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-1">
                          <Badge
                            className={`text-xs ${gameweekTeam.captainChangeEffectiveness.rating.colorClass}`}
                          >
                            {gameweekTeam.captainChangeEffectiveness.diff >= 0 ? "+" : ""}
                            {gameweekTeam.captainChangeEffectiveness.diff} pts
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {gameweekTeam.captainChangeEffectiveness.rating.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-[#8b4513]">
                    <TableHead className="w-[80px] dark:text-[#cc7744] font-mono">Position</TableHead>
                    <TableHead className="dark:text-[#cc7744] font-mono">Player Name</TableHead>
                    <TableHead className="text-center dark:text-[#cc7744] font-mono">GW Points</TableHead>
                    <TableHead className="text-center dark:text-[#cc7744] font-mono">Contributed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameweekTeam.players
                    .sort((a, b) => a.position - b.position)
                    .map((player) => {
                      const playerScore = playerScoreMap.get(player.playerId)
                      return (
                        <TableRow
                          key={`${player.playerId}-${player.position}`}
                          className={`${player.position > 11 ? "bg-muted/50 dark:bg-[#2a1f1a]" : ""} dark:border-[#8b4513]`}
                        >
                          <TableCell className="font-medium font-mono dark:text-[#cc7744]">
                            {player.position}
                          </TableCell>
                          <TableCell className="font-medium dark:text-[#cc7744]">
                            {player.playerName}
                            {playerScore?.multiplier === 0 && (
                              <span className="ml-2">🚫</span>
                            )}
                            {player.isCaptain && (
                              <Badge variant="default" className="ml-2 text-xs font-mono dark:bg-[#ff9966] dark:text-[#1a0f0a]">
                                C
                              </Badge>
                            )}
                            {player.isViceCaptain && (
                              <Badge variant="secondary" className="ml-2 text-xs font-mono dark:bg-[#8b6f47] dark:text-[#1a0f0a]">
                                VC
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-mono dark:text-[#cc7744]">
                            {playerScore?.gameweekPoints ?? 0}
                          </TableCell>
                          <TableCell className="text-center font-semibold font-mono dark:text-[#ff9966]">
                            {playerScore?.contributedPoints ?? 0}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
