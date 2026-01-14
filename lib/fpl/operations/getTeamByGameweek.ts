/**
 * Maps FPL bootstrap static elements with gameweek picks to provide player details
 *
 * Output structure:
 * {
 *   playerId: number,
 *   playerName: string,
 *   gameweekNumber: number,
 *   position: number,
 *   multiplier: number,
 *   isCaptain: boolean,
 *   isViceCaptain: boolean
 * }
 */

import { getBootstrapStatic, getPicksByGameweek } from "../service";
import { element, picks_by_gameweek } from "../types/fpl";

export interface TeamPlayer {
    playerId: number;
    playerName: string;
    gameweekNumber: number;
    position: number;
    multiplier: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
}

function mapPicksToTeamPlayers(
    elements: element[],
    picksData: picks_by_gameweek
): TeamPlayer[] {
    // Create a map for quick element lookup by id
    const elementMap = new Map(elements.map(el => [el.id, el]));

    return picksData.picks.map(pick => {
        const element = elementMap.get(pick.element);

        return {
            playerId: pick.element,
            playerName: element?.web_name || 'Unknown Player',
            gameweekNumber: picksData.entry_history.event,
            position: pick.position,
            multiplier: pick.multiplier,
            isCaptain: pick.is_captain,
            isViceCaptain: pick.is_vice_captain
        };
    });
}

async function getTeamForGameweek(id: string) {
    const bootstrapStatic = await getBootstrapStatic();
    const picksByGameweek = await getPicksByGameweek(id, '1');

    return mapPicksToTeamPlayers(bootstrapStatic.elements, picksByGameweek);
}

export { getTeamForGameweek, mapPicksToTeamPlayers }
