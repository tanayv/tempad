"use client"

import { GameweekTeam } from "@/lib/fpl/operations/getTeamTransfers"
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
  gameweekTeams: GameweekTeam[]
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

      {gameweekTeams.map((gameweekTeam) => (
        <Card key={gameweekTeam.gameweek}>
          <CardHeader>
            <CardTitle>Gameweek {gameweekTeam.gameweek}</CardTitle>
            <CardDescription>
              {gameweekTeam.transfers.length > 0 ? (
                <div className="mt-2 space-y-1">
                  <p className="font-medium text-sm">Transfers:</p>
                  {gameweekTeam.transfers.map((transfer, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Badge variant="destructive" className="text-xs">
                        OUT
                      </Badge>
                      <span>{transfer.elementOutName}</span>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="default" className="text-xs">
                        IN
                      </Badge>
                      <span>{transfer.elementInName}</span>
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
                  <TableHead>Player ID</TableHead>
                  <TableHead className="text-center">Multiplier</TableHead>
                  <TableHead className="text-center">Captain</TableHead>
                  <TableHead className="text-center">Vice Captain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gameweekTeam.players
                  .sort((a, b) => a.position - b.position)
                  .map((player) => (
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
                      <TableCell className="text-muted-foreground">
                        {player.playerId}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.multiplier}x
                      </TableCell>
                      <TableCell className="text-center">
                        {player.isCaptain ? "✓" : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {player.isViceCaptain ? "✓" : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
