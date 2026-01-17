/**
 * Calculate team scores with player contributions across gameweeks
 */

import { getPlayerSummary } from "../service";
import { GameweekTeam, Transfer } from "./getTeamTransfers";

export interface PlayerScore {
    playerId: number;
    playerName: string;
    gameweekPoints: number;
    multiplier: number;
    contributedPoints: number;
}

export type EffectivenessRating = "disasterclass" | "bad" | "no-impact" | "good" | "masterclass";

export interface EffectivenessRatingInfo {
    rating: EffectivenessRating;
    label: string;
    colorClass: string;
}

export interface TransferEffectiveness {
    transfer: Transfer;
    transferredInPoints: number;
    transferredOutPoints: number;
    transferredInContributed: number;
    transferredOutHypotheticalContributed: number;
    transferredOutMultiplier: number;
    diff: number;
    rating: EffectivenessRatingInfo;
}

export interface CaptainChangeEffectiveness {
    previousCaptainId: number;
    previousCaptainName: string;
    previousCaptainContribution: number;
    currentCaptainId: number;
    currentCaptainName: string;
    currentCaptainContribution: number;
    diff: number;
    rating: EffectivenessRatingInfo;
}

export interface GameweekScore {
    gameweek: number;
    totalScore: number;
    playerScores: PlayerScore[];
}

export interface TeamScoreData extends GameweekTeam {
    totalScore: number;
    playerScores: PlayerScore[];
    transferEffectiveness: TransferEffectiveness[];
    captainChangeEffectiveness: CaptainChangeEffectiveness | null;
}

/**
 * Get rating based on point difference
 */
function getRating(diff: number): EffectivenessRatingInfo {
    if (diff <= -10) {
        return {
            rating: "disasterclass",
            label: "Disasterclass",
            colorClass: "bg-red-900 hover:bg-red-950"
        };
    } else if (diff < 0) {
        return {
            rating: "bad",
            label: "Bad choice",
            colorClass: "bg-red-600 hover:bg-red-700"
        };
    } else if (diff === 0) {
        return {
            rating: "no-impact",
            label: "No impact",
            colorClass: "bg-gray-500 hover:bg-gray-600"
        };
    } else if (diff < 10) {
        return {
            rating: "good",
            label: "Good choice",
            colorClass: "bg-green-600 hover:bg-green-700"
        };
    } else {
        return {
            rating: "masterclass",
            label: "Masterclass",
            colorClass: "bg-purple-600 hover:bg-purple-700"
        };
    }
}

/**
 * Calculate scores for a single gameweek team
 */
async function calculateGameweekScore(
    gameweekTeam: GameweekTeam
): Promise<GameweekScore> {
    const playerScores: PlayerScore[] = [];
    let totalScore = 0;

    // Fetch player summaries for all players in parallel
    const playerSummaries = await Promise.all(
        gameweekTeam.players.map(async (player) => {
            try {
                const summary = await getPlayerSummary(player.playerId.toString());
                return { player, summary };
            } catch (error) {
                console.error(
                    `Error fetching summary for player ${player.playerId}:`,
                    error
                );
                return { player, summary: null };
            }
        })
    );

    // Calculate scores for each player
    for (const { player, summary } of playerSummaries) {
        let gameweekPoints = 0;

        if (summary) {
            // Find the history entry for this specific gameweek
            const historyEntry = summary.history.find(
                (h) => h.round === gameweekTeam.gameweek
            );

            if (historyEntry) {
                gameweekPoints = historyEntry.total_points;
            }
        }

        const contributedPoints = gameweekPoints * player.multiplier;
        totalScore += contributedPoints;

        playerScores.push({
            playerId: player.playerId,
            playerName: player.playerName,
            gameweekPoints,
            multiplier: player.multiplier,
            contributedPoints,
        });
    }

    return {
        gameweek: gameweekTeam.gameweek,
        totalScore,
        playerScores,
    };
}

/**
 * Calculate transfer effectiveness for a gameweek
 */
async function calculateTransferEffectiveness(
    gameweekTeam: GameweekTeam,
    playerScores: PlayerScore[],
    previousGameweek: GameweekTeam | null = null
): Promise<TransferEffectiveness[]> {
    const transferEffectiveness: TransferEffectiveness[] = [];

    // Create a map of player scores for quick lookup
    const playerScoreMap = new Map(
        playerScores.map((ps) => [ps.playerId, ps])
    );

    // For each transfer, calculate the effectiveness
    for (const transfer of gameweekTeam.transfers) {
        // Get the transferred in player's actual contribution
        const transferredInScore = playerScoreMap.get(transfer.elementIn);
        const transferredInPoints = transferredInScore?.gameweekPoints ?? 0;
        const transferredInContributed = transferredInScore?.contributedPoints ?? 0;
        const transferredInMultiplier = transferredInScore?.multiplier ?? 1;

        // Get the transferred out player's hypothetical contribution
        let transferredOutPoints = 0;
        try {
            const summary = await getPlayerSummary(transfer.elementOut.toString());
            const historyEntry = summary.history.find(
                (h) => h.round === gameweekTeam.gameweek
            );
            if (historyEntry) {
                transferredOutPoints = historyEntry.total_points;
            }
        } catch (error) {
            console.error(
                `Error fetching summary for transferred out player ${transfer.elementOut}:`,
                error
            );
        }

        // Get the transferred out player's multiplier from the previous gameweek
        let transferredOutMultiplier = transferredInMultiplier; // fallback to transferred in multiplier
        if (previousGameweek) {
            const previousPlayer = previousGameweek.players.find(p => p.playerId === transfer.elementOut);
            if (previousPlayer) {
                transferredOutMultiplier = previousPlayer.multiplier;
            }
        }

        // Calculate hypothetical contribution using the same multiplier as the transferred in player
        const transferredOutHypotheticalContributed = transferredOutPoints * transferredInMultiplier;

        // Calculate the diff (positive means transfer was good, negative means it was bad)
        const diff = transferredInContributed - transferredOutHypotheticalContributed;

        transferEffectiveness.push({
            transfer,
            transferredInPoints,
            transferredOutPoints,
            transferredInContributed,
            transferredOutHypotheticalContributed,
            transferredOutMultiplier,
            diff,
            rating: getRating(diff),
        });
    }

    return transferEffectiveness;
}


/**
 * Calculate captain change effectiveness with async support for transferred out captains
 */
async function calculateCaptainChangeEffectivenessAsync(
    previousGameweek: GameweekTeam | null,
    currentGameweek: GameweekTeam,
    previousPlayerScores: PlayerScore[] | null,
    currentPlayerScores: PlayerScore[]
): Promise<CaptainChangeEffectiveness | null> {
    // If no previous gameweek, no captain change to calculate
    if (!previousGameweek || !previousPlayerScores) {
        return null;
    }

    // Find the captain from previous gameweek
    const previousCaptain = previousGameweek.players.find(p => p.isCaptain);
    const currentCaptain = currentGameweek.players.find(p => p.isCaptain);

    if (!previousCaptain || !currentCaptain) {
        return null;
    }

    // If captain didn't change, no effectiveness to calculate
    if (previousCaptain.playerId === currentCaptain.playerId) {
        return null;
    }

    // Get the contributions for both captains in the current gameweek
    const currentCaptainScore = currentPlayerScores.find(
        ps => ps.playerId === currentCaptain.playerId
    );

    // Find what the previous captain would have scored in THIS gameweek
    const previousCaptainInCurrentGW = currentGameweek.players.find(
        p => p.playerId === previousCaptain.playerId
    );

    let previousCaptainCurrentContribution = 0;
    let previousCaptainPoints = 0;

    if (previousCaptainInCurrentGW) {
        // Previous captain is still in the team, use their actual score from current GW
        const previousCaptainScore = currentPlayerScores.find(
            ps => ps.playerId === previousCaptain.playerId
        );
        previousCaptainPoints = previousCaptainScore?.gameweekPoints ?? 0;
    } else {
        // Previous captain was transferred out, fetch their score
        try {
            const summary = await getPlayerSummary(previousCaptain.playerId.toString());
            const historyEntry = summary.history.find(
                (h) => h.round === currentGameweek.gameweek
            );
            if (historyEntry) {
                previousCaptainPoints = historyEntry.total_points;
            }
        } catch (error) {
            console.error(
                `Error fetching summary for previous captain ${previousCaptain.playerId}:`,
                error
            );
        }
    }

    // Calculate what they would have contributed as captain (multiplier 2)
    previousCaptainCurrentContribution = previousCaptainPoints * 2;

    const currentCaptainContribution = currentCaptainScore?.contributedPoints ?? 0;

    const diff = currentCaptainContribution - previousCaptainCurrentContribution;

    return {
        previousCaptainId: previousCaptain.playerId,
        previousCaptainName: previousCaptain.playerName,
        previousCaptainContribution: previousCaptainCurrentContribution,
        currentCaptainId: currentCaptain.playerId,
        currentCaptainName: currentCaptain.playerName,
        currentCaptainContribution,
        diff,
        rating: getRating(diff),
    };
}

/**
 * Calculate scores for all gameweeks
 */
export async function calculateTeamScores(
    gameweekTeams: GameweekTeam[]
): Promise<TeamScoreData[]> {
    const teamScoreData: TeamScoreData[] = [];
    let previousGameweek: GameweekTeam | null = null;
    let previousPlayerScores: PlayerScore[] | null = null;

    for (const gameweekTeam of gameweekTeams) {
        const gameweekScore = await calculateGameweekScore(gameweekTeam);

        // Calculate transfer effectiveness
        const transferEffectiveness = await calculateTransferEffectiveness(
            gameweekTeam,
            gameweekScore.playerScores,
            previousGameweek
        );

        // Calculate captain change effectiveness
        const captainChangeEffectiveness = await calculateCaptainChangeEffectivenessAsync(
            previousGameweek,
            gameweekTeam,
            previousPlayerScores,
            gameweekScore.playerScores
        );

        teamScoreData.push({
            ...gameweekTeam,
            totalScore: gameweekScore.totalScore,
            playerScores: gameweekScore.playerScores,
            transferEffectiveness,
            captainChangeEffectiveness,
        });

        // Update previous gameweek data for next iteration
        previousGameweek = gameweekTeam;
        previousPlayerScores = gameweekScore.playerScores;
    }

    return teamScoreData;
}
