import { bootstrap_static, picks_by_gameweek, element_summary, entry_response } from "./types/fpl";

// Use our internal API routes to avoid CORS issues
const internalApiUrl = '/api/fpl';

function getBaseUrl(): string {
    // Client-side: use relative URLs
    if (typeof window !== 'undefined') {
        return '';
    }

    // Server-side: use absolute URL for localhost
    // In production, you might want to use VERCEL_URL or your domain
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

async function fetchJSON<T>(endpoint: string): Promise<T> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${internalApiUrl}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.statusText} ${endpoint} - ${errorText}`);
    }

    return response.json();
}

async function getBootstrapStatic() {
    return fetchJSON<bootstrap_static>('/bootstrap-static');
}



async function getPicksByGameweek(managerId: string, gameweekId: string) {
    return fetchJSON<picks_by_gameweek>(`/entry/${managerId}/event/${gameweekId}/picks`);
}

async function getPlayerSummary(playerId: string) {
    return fetchJSON<element_summary>(`/element-summary/${playerId}`);
}

async function getManagerEntry(managerId: string) {
    return fetchJSON<entry_response>(`/entry/${managerId}`);
}

export {
    getBootstrapStatic,
    getPicksByGameweek,
    getPlayerSummary,
    getManagerEntry
}