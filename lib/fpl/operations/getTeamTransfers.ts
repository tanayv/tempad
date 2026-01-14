/**
 * Tracks team transfers across gameweeks by comparing picks between consecutive gameweeks
 */

import { getBootstrapStatic, getPicksByGameweek, getManagerEntry } from "../service";
import { element, picks_by_gameweek } from "../types/fpl";
import { TeamPlayer } from "./getTeamByGameweek";

export interface Transfer {
    gameweek: number;
    elementIn: number;
    elementInName: string;
    elementOut: number;
    elementOutName: string;
}

export interface GameweekTeam {
    gameweek: number;
    players: TeamPlayer[];
    transfers: Transfer[];
}

/**
 * Get all elapsed (finished) gameweeks
 */
function getElapsedGameweeks(events: any[]): number[] {
    return events
        .filter(event => event.finished === true)
        .map(event => event.id)
        .sort((a, b) => a - b);
}

/**
 * Compare two sets of picks to identify transfers
 */
function detectTransfers(
    previousGameweek: number,
    currentGameweek: number,
    previousPicks: picks_by_gameweek,
    currentPicks: picks_by_gameweek,
    elementMap: Map<number, element>
): Transfer[] {
    const previousElements = new Set(previousPicks.picks.map(p => p.element));
    const currentElements = new Set(currentPicks.picks.map(p => p.element));

    const transfers: Transfer[] = [];

    // Find elements that are in current but not in previous (transferred in)
    const elementsIn = Array.from(currentElements).filter(el => !previousElements.has(el));

    // Find elements that are in previous but not in current (transferred out)
    const elementsOut = Array.from(previousElements).filter(el => !currentElements.has(el));

    // Match transfers (should be equal number of ins and outs)
    for (let i = 0; i < Math.max(elementsIn.length, elementsOut.length); i++) {
        const elementIn = elementsIn[i] || 0;
        const elementOut = elementsOut[i] || 0;

        const elementInData = elementMap.get(elementIn);
        const elementOutData = elementMap.get(elementOut);

        transfers.push({
            gameweek: currentGameweek,
            elementIn,
            elementInName: elementInData?.web_name || 'Unknown',
            elementOut,
            elementOutName: elementOutData?.web_name || 'Unknown',
        });
    }

    return transfers;
}

/**
 * Map picks to team players with element names
 */
function mapPicksToTeamPlayers(
    gameweek: number,
    picksData: picks_by_gameweek,
    elementMap: Map<number, element>
): TeamPlayer[] {
    return picksData.picks.map(pick => {
        const element = elementMap.get(pick.element);

        return {
            playerId: pick.element,
            playerName: element?.web_name || 'Unknown Player',
            gameweekNumber: gameweek,
            position: pick.position,
            multiplier: pick.multiplier,
            isCaptain: pick.is_captain,
            isViceCaptain: pick.is_vice_captain
        };
    });
}

/**
 * Get all teams and transfers for a manager across all elapsed gameweeks
 */
export async function getTeamTransfers(managerId: string): Promise<GameweekTeam[]> {
    // Fetch manager entry to get the started event
    const managerEntry = await getManagerEntry(managerId);
    const startedEvent = managerEntry.started_event;

    const bootstrapStatic = await getBootstrapStatic();
    const allElapsedGameweeks = getElapsedGameweeks(bootstrapStatic.events);

    // Filter gameweeks to only include those from or after the team's started event
    const elapsedGameweeks = allElapsedGameweeks.filter(gw => gw >= startedEvent);

    // Create element map for quick lookups
    const elementMap = new Map(bootstrapStatic.elements.map(el => [el.id, el]));

    const gameweekTeams: GameweekTeam[] = [];
    let previousPicks: picks_by_gameweek | null = null;

    for (const gameweek of elapsedGameweeks) {
        const currentPicks = await getPicksByGameweek(managerId, gameweek.toString());

        const players = mapPicksToTeamPlayers(gameweek, currentPicks, elementMap);

        let transfers: Transfer[] = [];
        if (previousPicks) {
            transfers = detectTransfers(
                gameweek - 1,
                gameweek,
                previousPicks,
                currentPicks,
                elementMap
            );
        }

        gameweekTeams.push({
            gameweek,
            players,
            transfers
        });

        previousPicks = currentPicks;
    }

    return gameweekTeams;
}
