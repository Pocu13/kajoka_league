export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

export interface MatchSet {
  team1Score: number;
  team2Score: number;
}

export interface Match {
  id: string;
  groupId: string;
  team1Id: string;
  team2Id: string;
  date: string;
  time?: string;
  giornata?: number;
  sets: MatchSet[];
  completed: boolean;
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  setDifference: number;
  points: number;
}

export interface BracketMatch {
  id: string;
  team1Id: string | null;
  team2Id: string | null;
  winnerId: string | null;
  round: "quarter" | "semi" | "final";
  position: number;
}

export interface TournamentData {
  teams: Team[];
  groups: Group[];
  matches: Match[];
  bracket: BracketMatch[];
}
