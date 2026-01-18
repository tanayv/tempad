import { bootstrap_static, picks_by_gameweek, element_summary, entry_response } from "./types/fpl";

// FPL API service that calls the external API directly
const fplApiUrl = 'https://fantasy.premierleague.com/api';

async function fetchFplAPI<T>(endpoint: string): Promise<T> {
    const url = `${fplApiUrl}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        next: {
            revalidate: 60 // Cache for 1 minute
        }
    });

    if (!response.ok) {
        console.error(`FPL API error for ${endpoint}: ${response.status} ${response.statusText}`);
        throw new Error(`FPL API error: ${response.status} ${response.statusText} for ${endpoint}`);
    }

    return response.json();
}

// FPL API functions
export async function getBootstrapStatic(): Promise<bootstrap_static> {
    return fetchFplAPI<bootstrap_static>('/bootstrap-static/');
}

export async function getManagerEntry(managerId: string): Promise<entry_response> {
    return fetchFplAPI<entry_response>(`/entry/${managerId}/`);
}

export async function getPicksByGameweek(managerId: string, gameweekId: string): Promise<picks_by_gameweek> {
    return fetchFplAPI<picks_by_gameweek>(`/entry/${managerId}/event/${gameweekId}/picks/`);
}

export async function getPlayerSummary(playerId: string): Promise<element_summary> {
    return fetchFplAPI<element_summary>(`/element-summary/${playerId}/`);
}

// Custom caching for bootstrap-static (large response)
let bootstrapCache: bootstrap_static | null = null;
let bootstrapCacheTimestamp = 0;
const BOOTSTRAP_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getBootstrapStaticCached(): Promise<bootstrap_static> {
    const now = Date.now();

    // Return cached data if still valid
    if (bootstrapCache && (now - bootstrapCacheTimestamp) < BOOTSTRAP_CACHE_DURATION) {
        return bootstrapCache;
    }

    // Fetch fresh data
    bootstrapCache = await getBootstrapStatic();
    bootstrapCacheTimestamp = now;

    return bootstrapCache;
}