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

export interface TransferEffectiveness {
    transfer: Transfer;
    transferredInPoints: number;
    transferredOutPoints: number;
    transferredInContributed: number;
    transferredOutHypotheticalContributed: number;
    diff: number;
    isPositive: boolean;
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
    playerScores: PlayerScore[]
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
            diff,
            isPositive: diff >= 0,
        });
    }

    return transferEffectiveness;
}

/**
 * Calculate scores for all gameweeks
 */
export async function calculateTeamScores(
    gameweekTeams: GameweekTeam[]
): Promise<TeamScoreData[]> {
    const teamScoreData: TeamScoreData[] = [];

    for (const gameweekTeam of gameweekTeams) {
        const gameweekScore = await calculateGameweekScore(gameweekTeam);

        // Calculate transfer effectiveness
        const transferEffectiveness = await calculateTransferEffectiveness(
            gameweekTeam,
            gameweekScore.playerScores
        );

        teamScoreData.push({
            ...gameweekTeam,
            totalScore: gameweekScore.totalScore,
            playerScores: gameweekScore.playerScores,
            transferEffectiveness,
        });
    }

    return teamScoreData;
}
