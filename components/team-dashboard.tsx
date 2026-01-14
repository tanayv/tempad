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
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">FPL Team Timeline</h1>
        <p className="text-muted-foreground">
          View your team composition and transfers across all gameweeks
        </p>
      </div>

      {gameweekTeams.map((gameweekTeam) => {
        // Create a map of player scores for quick lookup
        const playerScoreMap = new Map(
          gameweekTeam.playerScores.map((ps) => [ps.playerId, ps])
        )

        return (
          <Card key={gameweekTeam.gameweek}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gameweek {gameweekTeam.gameweek}</CardTitle>
                <Badge variant="default" className="text-lg px-4 py-1">
                  Total: {gameweekTeam.totalScore} pts
                </Badge>
              </div>
              <CardDescription>
                {gameweekTeam.transfers.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    <p className="font-medium text-sm">Transfers:</p>
                    {gameweekTeam.transferEffectiveness.map((effectiveness, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="destructive" className="text-xs">
                            OUT
                          </Badge>
                          <span>{effectiveness.transfer.elementOutName}</span>
                          <span className="text-muted-foreground text-xs">
                            ({effectiveness.transferredOutPoints} pts)
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="default" className="text-xs">
                            IN
                          </Badge>
                          <span>{effectiveness.transfer.elementInName}</span>
                          <span className="text-muted-foreground text-xs">
                            ({effectiveness.transferredInPoints} pts)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-1">
                          <Badge
                            variant={effectiveness.isPositive ? "default" : "destructive"}
                            className={`text-xs ${
                              effectiveness.isPositive
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {effectiveness.isPositive ? "+" : ""}
                            {effectiveness.diff} pts
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {effectiveness.isPositive
                              ? "Good transfer"
                              : "Bad transfer"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm">No transfers made</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Position</TableHead>
                    <TableHead>Player Name</TableHead>
                    <TableHead className="text-center">GW Points</TableHead>
                    <TableHead className="text-center">Contributed</TableHead>
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
                          className={player.position > 11 ? "bg-muted/50" : ""}
                        >
                          <TableCell className="font-medium">
                            {player.position}
                          </TableCell>
                          <TableCell className="font-medium">
                            {player.playerName}
                            {player.isCaptain && (
                              <Badge variant="default" className="ml-2 text-xs">
                                C
                              </Badge>
                            )}
                            {player.isViceCaptain && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                VC
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {playerScore?.gameweekPoints ?? 0}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
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
