/**
 * Calculate alternate timeline branches showing what would happen if teams were frozen at each gameweek
 */

import { getPlayerSummary } from "../fpl-service";
import { GameweekTeam } from "./getTeamTransfers";
import { TeamScoreData } from "./calculateTeamScores";

export interface TimelineBranchScore {
    gameweek: number;
    gameweekScore: number; // Score for this specific gameweek
    cumulativeScore: number; // Running total up to this gameweek
}

export interface TimelineBranch {
    branchId: number; // The gameweek this branch originates from
    originGameweek: number;
    branchLabel: string; // e.g., "GW1 Team (No Changes)"
    scores: TimelineBranchScore[];
    totalPointsToDate: number; // Total cumulative points up to the latest gameweek
}

export interface AlternateTimeline {
    mainBranch: TimelineBranchScore[]; // Actual scores with transfers
    mainTotalPoints: number; // Total points for main branch
    branches: TimelineBranch[]; // All alternate branches (frozen teams)
}

/**
 * Calculate score for a frozen team composition in a specific gameweek
 */
async function calculateFrozenTeamScore(
    frozenTeam: GameweekTeam,
    targetGameweek: number
): Promise<number> {
    let totalScore = 0;

    // Fetch player summaries for all players in the frozen team
    const playerSummaries = await Promise.all(
        frozenTeam.players.map(async (player) => {
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

    // Calculate scores for each player in the target gameweek
    for (const { player, summary } of playerSummaries) {
        let gameweekPoints = 0;

        if (summary) {
            // Find the history entry for the target gameweek
            const historyEntry = summary.history.find(
                (h) => h.round === targetGameweek
            );

            if (historyEntry) {
                gameweekPoints = historyEntry.total_points;
            }
        }

        // Use the frozen team's multiplier (captain, vice-captain, bench)
        const contributedPoints = gameweekPoints * player.multiplier;
        totalScore += contributedPoints;
    }

    return totalScore;
}

/**
 * Calculate all alternate timeline branches with cumulative scores
 */
export async function calculateAlternateTimelines(
    teamScoreData: TeamScoreData[]
): Promise<AlternateTimeline> {
    // Main branch: actual scores with all transfers (cumulative)
    let mainCumulative = 0;
    const mainBranch: TimelineBranchScore[] = teamScoreData.map(gw => {
        mainCumulative += gw.totalScore;
        return {
            gameweek: gw.gameweek,
            gameweekScore: gw.totalScore,
            cumulativeScore: mainCumulative
        };
    });

    // Create branches for each gameweek
    const branches: TimelineBranch[] = [];

    for (let i = 0; i < teamScoreData.length; i++) {
        const originTeam = teamScoreData[i];
        if (!originTeam) continue;
        const originGameweek = originTeam.gameweek;

        // Calculate scores for this frozen team across all subsequent gameweeks
        const branchScores: TimelineBranchScore[] = [];
        let branchCumulative = 0;

        // Add scores for all gameweeks from the start up to origin
        for (let k = 0; k < i; k++) {
            const gameweekData = teamScoreData[k];
            if (!gameweekData) continue;
            branchCumulative += gameweekData.totalScore;
            branchScores.push({
                gameweek: gameweekData.gameweek,
                gameweekScore: gameweekData.totalScore,
                cumulativeScore: branchCumulative
            });
        }

        // Include the origin gameweek score (actual score at branch point)
        branchCumulative += originTeam.totalScore;
        branchScores.push({
            gameweek: originGameweek,
            gameweekScore: originTeam.totalScore,
            cumulativeScore: branchCumulative
        });

        // Calculate scores for all subsequent gameweeks using frozen team
        for (let j = i + 1; j < teamScoreData.length; j++) {
            const targetGameweekData = teamScoreData[j];
            if (!targetGameweekData) continue;
            const targetGameweek = targetGameweekData.gameweek;

            const frozenScore = await calculateFrozenTeamScore(
                originTeam,
                targetGameweek
            );

            branchCumulative += frozenScore;
            branchScores.push({
                gameweek: targetGameweek,
                gameweekScore: frozenScore,
                cumulativeScore: branchCumulative
            });
        }

        branches.push({
            branchId: i,
            originGameweek,
            branchLabel: `GW${originGameweek} Team (Frozen)`,
            scores: branchScores,
            totalPointsToDate: branchCumulative
        });
    }

    return {
        mainBranch,
        mainTotalPoints: mainCumulative,
        branches
    };
}
