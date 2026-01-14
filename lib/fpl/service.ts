import { bootstrap_static, picks_by_gameweek, player_history, element_summary, entry_response } from "./types/fpl";

const fplApiUrl = 'https://fantasy.premierleague.com/api';

async function fetchJSON<T>(endpoint: string): Promise<T> {
    const url = `${fplApiUrl}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(`FPL API error: ${response.statusText} ${endpoint}`);
    }

    return response.json();
}

async function getBootstrapStatic() {
    return fetchJSON<bootstrap_static>('/bootstrap-static/');
}

async function getManagerHistory(managerId: string) {
    return fetchJSON<player_history>(`/entry/${managerId}/history/`);
}

async function getManagerTransfers(managerId: string) {
    return fetchJSON<any[]>(`/entry/${managerId}/transfers/`);
}

async function getPicksByGameweek(managerId: string, gameweekId: string) {
    return fetchJSON<picks_by_gameweek>(`/entry/${managerId}/event/${gameweekId}/picks`);
}

async function getPlayerSummary(playerId: string) {
    return fetchJSON<element_summary>(`/element-summary/${playerId}/`);
}

async function getManagerEntry(managerId: string) {
    return fetchJSON<entry_response>(`/entry/${managerId}/`);
}

export {
    getBootstrapStatic,
    getPicksByGameweek,
    getPlayerSummary,
    getManagerEntry
}