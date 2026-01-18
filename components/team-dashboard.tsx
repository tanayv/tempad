"use client"

import { useState, useEffect } from "react"
import { TeamScoreData } from "@/lib/fpl/operations/calculateTeamScores"
import { getBootstrapStatic } from "@/lib/fpl/service"
import { element, team } from "@/lib/fpl/types/fpl"
import { PlayerOverlay } from "@/components/player-overlay"
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
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: number
    code: number
    firstName: string
    lastName: string
    webName: string
    photo: string
    position: string
    team: string
    status: "TRANSFERRED IN" | "TRANSFERRED OUT"
    currentGameweekPoints?: number
    previousGameweekPoints?: number
    totalPoints: number
    nowCost: number
    form: string
    weeksInTeam?: number
    pointsWhileInTeam?: number
  } | null>(null)
  const [elements, setElements] = useState<Map<number, element>>(new Map())
  const [teams, setTeams] = useState<Map<number, team>>(new Map())
  const [elementTypes, setElementTypes] = useState<Map<number, { name: string }>>(new Map())

  // Fetch bootstrap-static data on component mount
  useEffect(() => {
    const fetchBootstrapData = async () => {
      try {
        const bootstrapData = await getBootstrapStatic()

        // Create element map
        const elementsMap = new Map<number, element>()
        bootstrapData.elements.forEach(element => {
          elementsMap.set(element.id, element)
        })
        setElements(elementsMap)

        // Create teams map
        const teamsMap = new Map<number, team>()
        bootstrapData.teams.forEach(team => {
          teamsMap.set(team.id, team)
        })
        setTeams(teamsMap)

        // Create element types map
        const typesMap = new Map()
        bootstrapData.element_types.forEach((type: unknown) => {
          const elementType = type as { id: number; singular_name: string }
          typesMap.set(elementType.id, { name: elementType.singular_name })
        })
        setElementTypes(typesMap)
      } catch (error) {
        console.error('Failed to fetch bootstrap data:', error)
      }
    }

    fetchBootstrapData()
  }, [])

  const handlePlayerClick = (
    playerId: number,
    status: "TRANSFERRED IN" | "TRANSFERRED OUT",
    currentPoints?: number,
    previousPoints?: number,
    gameweekContext?: { gameweek: number }
  ) => {
    const element = elements.get(playerId)
    const team = element ? teams.get(element.team) : null
    const elementType = element ? elementTypes.get(element.element_type) : null

    if (element && team && elementType) {
      // Calculate weeks in team and points while in team for transferred out players
      let weeksInTeam: number | undefined
      let pointsWhileInTeam: number | undefined

      if (status === "TRANSFERRED OUT" && gameweekContext) {
        // Find all gameweeks where this player was in the team
        const playerGameweeks = gameweekTeams.filter(gwTeam =>
          gwTeam.gameweek <= gameweekContext.gameweek &&
          gwTeam.playerScores.some(ps => ps.playerId === playerId)
        )

        weeksInTeam = playerGameweeks.length
        pointsWhileInTeam = playerGameweeks.reduce((total, gwTeam) => {
          const playerScore = gwTeam.playerScores.find(ps => ps.playerId === playerId)
          return total + (playerScore ? playerScore.gameweekPoints * playerScore.multiplier : 0)
        }, 0)
      }

      const playerData = {
        id: element.id,
        code: element.code,
        firstName: element.first_name,
        lastName: element.second_name,
        webName: element.web_name,
        photo: element.photo,
        position: elementType.name,
        team: team.short_name,
        status,
        totalPoints: element.total_points,
        nowCost: element.now_cost,
        form: element.form,
        ...(currentPoints !== undefined && { currentGameweekPoints: currentPoints }),
        ...(previousPoints !== undefined && { previousGameweekPoints: previousPoints }),
        ...(weeksInTeam !== undefined && { weeksInTeam }),
        ...(pointsWhileInTeam !== undefined && { pointsWhileInTeam }),
      }
      setSelectedPlayer(playerData)
      setIsOverlayOpen(true)
    }
  }
  return (
    <div className="space-y-8">

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
                    <div className="space-y-2 pb-2">
                      <p className="font-medium text-sm dark:text-[#ff9966] font-mono">Transfers:</p>
                      {gameweekTeam.transferEffectiveness.map((effectiveness, idx) => {
                        // Find the transferred in and out players to check their multipliers
                        const transferredInPlayer = playerScoreMap.get(effectiveness.transfer.elementIn);

                        return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-mono">
                            <Badge variant="destructive" className="text-xs font-mono dark:bg-red-900/50 dark:text-red-400">
                              OUT
                            </Badge>
                            <button
                              className="dark:text-[#cc7744] hover:text-[#ff9966] underline cursor-pointer transition-colors"
                              onClick={() => handlePlayerClick(
                                effectiveness.transfer.elementOut,
                                "TRANSFERRED OUT",
                                undefined, // We'll need to get previous GW points
                                effectiveness.transferredOutPoints,
                                { gameweek: gameweekTeam.gameweek }
                              )}
                            >
                              {effectiveness.transfer.elementOutName}
                            </button>
                            <span className="text-muted-foreground text-xs dark:text-[#8b6f47]">
                              ({effectiveness.transferredOutMultiplier === 0 ? (
                                <><span className="line-through">{effectiveness.transferredOutPoints}</span> → 0 pts</>
                              ) : (
                                `${effectiveness.transferredOutPoints} pts`
                              )})
                            </span>
                            <span className="text-muted-foreground dark:text-[#cc7744]">→</span>
                            <Badge variant="default" className="text-xs font-mono dark:bg-green-900/50 dark:text-green-400">
                              IN
                            </Badge>
                            <button
                              className="dark:text-[#cc7744] hover:text-[#ff9966] underline cursor-pointer transition-colors"
                              onClick={() => handlePlayerClick(
                                effectiveness.transfer.elementIn,
                                "TRANSFERRED IN",
                                effectiveness.transferredInPoints,
                                undefined, // We'll need to get previous GW points for this player too
                                { gameweek: gameweekTeam.gameweek }
                              )}
                            >
                              {effectiveness.transfer.elementInName}
                            </button>
                            <span className="text-muted-foreground text-xs dark:text-[#8b6f47]">
                              ({transferredInPlayer?.multiplier === 0 ? (
                                <><span className="line-through">{effectiveness.transferredInPoints}</span> → 0 pts</>
                              ) : (
                                `${effectiveness.transferredInPoints} pts`
                              )})
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
                        )
                      })}
                    </div>
                  ) : (
                    <span className="text-sm pb-2 block">No transfers made</span>
                  )}

                  {/* Captain Change Effectiveness */}
                  {gameweekTeam.captainChangeEffectiveness && (
                    <div className="space-y-2 pt-2 pb-2 border-t dark:border-[#8b4513]">
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

      {/* Player Overlay */}
      {selectedPlayer && (
        <PlayerOverlay
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
          playerData={selectedPlayer}
        />
      )}
    </div>
  )
}
