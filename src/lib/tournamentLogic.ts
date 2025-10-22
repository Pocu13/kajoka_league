import { Match, Standing, Team, MatchSet } from "@/types/tournament";

export const calculateStandings = (
  matches: Match[],
  teams: Team[],
  groupId: string
): Standing[] => {
  const standings: Record<string, Standing> = {};

  // Initialize standings for all teams in the group
  const groupMatches = matches.filter(m => m.groupId === groupId);
  const teamIds = new Set<string>();
  groupMatches.forEach(match => {
    teamIds.add(match.team1Id);
    teamIds.add(match.team2Id);
  });

  teamIds.forEach(teamId => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      standings[teamId] = {
        teamId,
        teamName: team.name,
        played: 0,
        wins: 0,
        losses: 0,
        setsWon: 0,
        setsLost: 0,
        setDifference: 0,
        points: 0,
      };
    }
  });

  // Calculate standings from completed matches
  groupMatches
    .filter(match => match.completed)
    .forEach(match => {
      const team1Sets = match.sets.filter(s => s.team1Score > s.team2Score).length;
      const team2Sets = match.sets.filter(s => s.team2Score > s.team1Score).length;
      
      const team1Won = team1Sets > team2Sets;
      
      // Update team 1
      standings[match.team1Id].played++;
      standings[match.team1Id].setsWon += team1Sets;
      standings[match.team1Id].setsLost += team2Sets;
      standings[match.team1Id].setDifference = 
        standings[match.team1Id].setsWon - standings[match.team1Id].setsLost;
      
      if (team1Won) {
        standings[match.team1Id].wins++;
        standings[match.team1Id].points += 3;
      } else {
        standings[match.team1Id].losses++;
      }
      
      // Update team 2
      standings[match.team2Id].played++;
      standings[match.team2Id].setsWon += team2Sets;
      standings[match.team2Id].setsLost += team1Sets;
      standings[match.team2Id].setDifference = 
        standings[match.team2Id].setsWon - standings[match.team2Id].setsLost;
      
      if (!team1Won) {
        standings[match.team2Id].wins++;
        standings[match.team2Id].points += 3;
      } else {
        standings[match.team2Id].losses++;
      }
    });

  // Sort by points, then by set difference
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.setDifference - a.setDifference;
  });
};

export const validateSetScore = (score1: number, score2: number): boolean => {
  // Valid set scores: winner must have 6-7 points, loser must have 0-6 points
  const maxScore = Math.max(score1, score2);
  const minScore = Math.min(score1, score2);
  
  if (maxScore < 6 || maxScore > 7) return false;
  if (minScore < 0 || minScore > 6) return false;
  if (maxScore === 6 && minScore === 6) return false; // Must be 7-6 not 6-6
  if (maxScore === 7 && minScore !== 6) return false; // 7 only valid with 6
  
  return true;
};

export const isMatchComplete = (sets: MatchSet[]): boolean => {
  if (sets.length === 0) return false;
  
  let team1Sets = 0;
  let team2Sets = 0;
  
  for (const set of sets) {
    if (!validateSetScore(set.team1Score, set.team2Score)) return false;
    if (set.team1Score > set.team2Score) team1Sets++;
    else team2Sets++;
  }
  
  // Best of 3: first to 2 sets wins
  return team1Sets === 2 || team2Sets === 2;
};

export const getMatchWinner = (sets: MatchSet[]): 1 | 2 | null => {
  let team1Sets = 0;
  let team2Sets = 0;
  
  for (const set of sets) {
    if (set.team1Score > set.team2Score) team1Sets++;
    else team2Sets++;
  }
  
  if (team1Sets === 2) return 1;
  if (team2Sets === 2) return 2;
  return null;
};
