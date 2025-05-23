export interface Player {
  id: number;
  name: string;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  wickets?: number;
  oversBowled?: number;
  runsConceded?: number;
}

export interface Team {
  name: string;
  players: Player[];
}

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalty: number;
}

export interface Delivery {
  batterId: number;
  bowlerId: number;
  runs: number;
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'runOut' | 'stumped' | 'hitWicket' | 'other';
  extras?: {
    type: 'wide' | 'noBall' | 'bye' | 'legBye' | 'penalty';
    runs: number;
  };
}

export interface Over {
  number: number;
  deliveries: Delivery[];
}

export interface Innings {
  battingTeamId: number;
  bowlingTeamId: number;
  overs: Over[];
  totalRuns: number;
  totalWickets: number;
  completedOvers: number;
  extras: Extras;
}

export interface Match {
  id: string;
  date: string;
  venue?: string;
  totalOvers: number;
  playersPerTeam: number;
  team1: Team;
  team2: Team;
  innings: Innings[];
  currentInnings: number;
  isComplete: boolean;
  tossWinner: number;
  tossDecision: 'bat' | 'bowl';
}

export interface MatchSummary {
  id: string;
  date: string;
  team1Name: string;
  team2Name: string;
  team1Score: string;
  team2Score: string;
  result: string;
  tossWinner: string;
  tossDecision: string;
}