// FPL API Types - Snake Case (Raw API Format)

// Primitive types and common fields
export type fpl_id = number;
export type team_id = number;
export type element_id = number;
export type event_id = number;
export type fixture_id = number;
export type league_id = number;
export type entry_id = number;

export type fpl_boolean = boolean;
export type fpl_string = string;
export type fpl_number = number;
export type fpl_null = null;
export type fpl_decimal_string = string; // API returns some numbers as strings like "1.4"

// Common stats that appear across multiple endpoints
export interface base_stats {
    minutes: fpl_number;
    goals_scored: fpl_number;
    assists: fpl_number;
    clean_sheets: fpl_number;
    goals_conceded: fpl_number;
    own_goals: fpl_number;
    penalties_saved: fpl_number;
    penalties_missed: fpl_number;
    yellow_cards: fpl_number;
    red_cards: fpl_number;
    saves: fpl_number;
    bonus: fpl_number;
    bps: fpl_number;
    influence: fpl_decimal_string;
    creativity: fpl_decimal_string;
    threat: fpl_decimal_string;
    ict_index: fpl_decimal_string;
    starts: fpl_number;
    expected_goals: fpl_decimal_string;
    expected_assists: fpl_decimal_string;
    expected_goal_involvements: fpl_decimal_string;
    expected_goals_conceded: fpl_decimal_string;
}

export interface extended_stats extends base_stats {
    clearances_blocks_interceptions: fpl_number;
    recoveries: fpl_number;
    tackles: fpl_number;
    defensive_contribution: fpl_number;
}

// Team related types
export interface team {
    code: fpl_number;
    draw: fpl_number;
    form: fpl_null | fpl_string;
    id: team_id;
    loss: fpl_number;
    name: fpl_string;
    played: fpl_number;
    points: fpl_number;
    position: fpl_number;
    short_name: fpl_string;
    strength: fpl_number;
    team_division: fpl_null | fpl_string;
    unavailable: fpl_boolean;
    win: fpl_number;
    strength_overall_home: fpl_number;
    strength_overall_away: fpl_number;
    strength_attack_home: fpl_number;
    strength_attack_away: fpl_number;
    strength_defence_home: fpl_number;
    strength_defence_away: fpl_number;
}

// Element (Player) related types
export interface element {
    id: element_id;
    code: fpl_number;
    element_type: fpl_number;
    team: team_id;
    team_code: fpl_number;
    first_name: fpl_string;
    second_name: fpl_string;
    web_name: fpl_string;
    now_cost: fpl_number;
    cost_change_event: fpl_number;
    cost_change_event_fall: fpl_number;
    cost_change_start: fpl_number;
    cost_change_start_fall: fpl_number;
    dreamteam_count: fpl_number;
    event_points: fpl_number;
    form: fpl_decimal_string;
    in_dreamteam: fpl_boolean;
    news: fpl_string;
    news_added: fpl_null | fpl_string;
    photo: fpl_string;
    points_per_game: fpl_decimal_string;
    selected_by_percent: fpl_decimal_string;
    special: fpl_boolean;
    squad_number: fpl_null | fpl_number;
    status: fpl_string;
    total_points: fpl_number;
    transfers_in: fpl_number;
    transfers_in_event: fpl_number;
    transfers_out: fpl_number;
    transfers_out_event: fpl_number;
    value_form: fpl_decimal_string;
    value_season: fpl_decimal_string;
    can_transact: fpl_boolean;
    can_select: fpl_boolean;
    chance_of_playing_next_round: fpl_null | fpl_number;
    chance_of_playing_this_round: fpl_null | fpl_number;
}

// Event (Gameweek) related types
export interface event {
    id: event_id;
    name: fpl_string;
    deadline_time: fpl_string;
    average_entry_score: fpl_number;
    finished: fpl_boolean;
    data_checked: fpl_boolean;
    highest_scoring_entry: fpl_null | entry_id;
    deadline_time_epoch: fpl_number;
    deadline_time_game_offset: fpl_number;
    highest_score: fpl_null | fpl_number;
    is_previous: fpl_boolean;
    is_current: fpl_boolean;
    is_next: fpl_boolean;
    cup_leagues_created: fpl_boolean;
    h2h_ko_matches_created: fpl_boolean;
    ranked_count: fpl_number;
    chip_plays: chip_play[];
    most_selected: fpl_null | element_id;
    most_transferred_in: fpl_null | element_id;
    top_element: fpl_null | element_id;
    top_element_info: fpl_null | top_element_info;
    transfers_made: fpl_number;
    most_captained: fpl_null | element_id;
    most_vice_captained: fpl_null | element_id;
}

export interface chip_play {
    chip_name: fpl_string;
    num_played: fpl_number;
}

export interface top_element_info {
    id: element_id;
    points: fpl_number;
}

// Fixture related types
export interface fixture {
    id: fixture_id;
    code: fpl_number;
    team_h: team_id;
    team_h_score: fpl_null | fpl_number;
    team_a: team_id;
    team_a_score: fpl_null | fpl_number;
    event: event_id;
    finished: fpl_boolean;
    minutes: fpl_number;
    provisional_start_time: fpl_boolean;
    kickoff_time: fpl_string;
    event_name: fpl_string;
    is_home: fpl_boolean;
    difficulty: fpl_number;
}

// Player history types
export interface player_history {
    element: element_id;
    fixture: fixture_id;
    opponent_team: team_id;
    total_points: fpl_number;
    was_home: fpl_boolean;
    kickoff_time: fpl_string;
    team_h_score: fpl_number;
    team_a_score: fpl_number;
    round: event_id;
    modified: fpl_boolean;
    value: fpl_number;
    transfers_balance: fpl_number;
    selected: fpl_number;
    transfers_in: fpl_number;
    transfers_out: fpl_number;
}

export interface player_history_past {
    season_name: fpl_string;
    element_code: fpl_number;
    start_cost: fpl_number;
    end_cost: fpl_number;
    total_points: fpl_number;
}

// League types
export interface league {
    id: league_id;
    name: fpl_string;
    short_name: fpl_null | fpl_string;
    created: fpl_string;
    closed: fpl_boolean;
    rank: fpl_null | fpl_number;
    max_entries: fpl_null | fpl_number;
    league_type: fpl_string;
    scoring: fpl_string;
    admin_entry: fpl_null | entry_id;
    start_event: event_id;
    entry_can_leave: fpl_boolean;
    entry_can_admin: fpl_boolean;
    entry_can_invite: fpl_boolean;
    has_cup: fpl_boolean;
    cup_league: fpl_null;
    cup_qualified: fpl_null;
    rank_count: fpl_null | fpl_number;
    entry_percentile_rank: fpl_null | fpl_number;
    active_phases: league_phase[];
    entry_rank: fpl_number;
    entry_last_rank: fpl_number;
}

export interface league_phase {
    phase: fpl_number;
    rank: fpl_number;
    last_rank: fpl_number;
    rank_sort: fpl_number;
    total: fpl_number;
    league_id: league_id;
    rank_count: fpl_null | fpl_number;
    entry_percentile_rank: fpl_null | fpl_number;
}

// Live event types
export interface live_element {
    id: element_id;
    stats: live_stats;
    explain: explain[];
}

export interface live_stats extends extended_stats {
    total_points: fpl_number;
    in_dreamteam: fpl_boolean;
}

export interface explain {
    fixture: fixture_id;
    stats: explain_stat[];
}

export interface explain_stat {
    identifier: fpl_string;
    points: fpl_number;
    value: fpl_number;
    points_modification: fpl_number;
}

// Chip types
export interface chip {
    id: fpl_id;
    name: fpl_string;
    number: fpl_number;
    start_event: event_id;
    stop_event: event_id;
    chip_type: fpl_string;
    overrides: chip_overrides;
}

export interface chip_overrides {
    rules: object;
    scoring: object;
    element_types: fpl_number[];
    pick_multiplier: fpl_null | fpl_number;
}

// Main API response types
export interface bootstrap_static {
    chips: chip[];
    events: event[];
    game_settings: object;
    phases: object[];
    teams: team[];
    total_players: fpl_number;
    elements: element[];
    element_stats: object[];
    element_types: object[];
}

export interface element_summary {
    fixtures: fixture[];
    history: (player_history & extended_stats)[];
    history_past: (player_history_past & extended_stats)[];
}

export interface entry_response {
    id: entry_id;
    joined_time: fpl_string;
    started_event: event_id;
    favourite_team: fpl_null | team_id;
    player_first_name: fpl_string;
    player_last_name: fpl_string;
    player_region_id: fpl_number;
    player_region_name: fpl_string;
    player_region_iso_code_short: fpl_string;
    player_region_iso_code_long: fpl_string;
    years_active: fpl_number;
    summary_overall_points: fpl_number;
    summary_overall_rank: fpl_number;
    summary_event_points: fpl_number;
    summary_event_rank: fpl_number;
    current_event: event_id;
    leagues: {
        classic: league[];
        h2h: league[];
        cup: {
            matches: unknown[];
            status: {
                qualification_event: fpl_null | event_id;
                qualification_numbers: fpl_null | fpl_number;
                qualification_rank: fpl_null | fpl_number;
                qualification_state: fpl_null | fpl_string;
            };
            cup_league: fpl_null;
        };
        cup_matches: unknown[];
    };
    name: fpl_string;
    name_change_blocked: fpl_boolean;
    entered_events: event_id[];
    kit: fpl_null | fpl_string;
    last_deadline_bank: fpl_number;
    last_deadline_value: fpl_number;
    last_deadline_total_transfers: fpl_number;
    club_badge_src: fpl_null | fpl_string;
}

export interface live_event {
    elements: live_element[];
}

// Picks by gameweek types
export interface pick {
    element: element_id;
    position: fpl_number;
    multiplier: fpl_number;
    is_captain: fpl_boolean;
    is_vice_captain: fpl_boolean;
    element_type: fpl_number;
}

export interface automatic_sub {
    entry: entry_id;
    element_in: element_id;
    element_out: element_id;
    event: event_id;
}

export interface entry_history {
    event: event_id;
    points: fpl_number;
    total_points: fpl_number;
    rank: fpl_number;
    rank_sort: fpl_number;
    overall_rank: fpl_number;
    percentile_rank: fpl_number;
    bank: fpl_number;
    value: fpl_number;
    event_transfers: fpl_number;
    event_transfers_cost: fpl_number;
    points_on_bench: fpl_number;
}

export interface picks_by_gameweek {
    active_chip: fpl_string | fpl_null;
    automatic_subs: automatic_sub[];
    entry_history: entry_history;
    picks: pick[];
}