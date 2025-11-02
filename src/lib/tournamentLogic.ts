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
        gamesWon: 0,
        gamesLost: 0,
        gameDifference: 0,
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
      
      // Determine points based on match result
      // 2-0 win: 3 points to winner, 0 to loser
      // 2-1 win: 2 points to winner, 1 to loser
      let team1Points = 0;
      let team2Points = 0;
      
      if (team1Won) {
        team1Points = team1Sets === 2 && team2Sets === 0 ? 3 : 2;
        team2Points = team1Sets === 2 && team2Sets === 1 ? 1 : 0;
      } else {
        team2Points = team2Sets === 2 && team1Sets === 0 ? 3 : 2;
        team1Points = team2Sets === 2 && team1Sets === 1 ? 1 : 0;
      }
      
      // Calculate games won/lost for each set
      let team1GamesTotal = 0;
      let team2GamesTotal = 0;
      
      match.sets.forEach((set, index) => {
        // Special rule: 3rd set (super tie-break) counts as 7-6 or 6-7
        if (index === 2) {
          if (set.team1Score > set.team2Score) {
            team1GamesTotal += 7;
            team2GamesTotal += 6;
          } else {
            team1GamesTotal += 6;
            team2GamesTotal += 7;
          }
        } else {
          team1GamesTotal += set.team1Score;
          team2GamesTotal += set.team2Score;
        }
      });
      
      // Update team 1
      standings[match.team1Id].played++;
      standings[match.team1Id].setsWon += team1Sets;
      standings[match.team1Id].setsLost += team2Sets;
      standings[match.team1Id].setDifference = 
        standings[match.team1Id].setsWon - standings[match.team1Id].setsLost;
      standings[match.team1Id].gamesWon += team1GamesTotal;
      standings[match.team1Id].gamesLost += team2GamesTotal;
      standings[match.team1Id].gameDifference = 
        standings[match.team1Id].gamesWon - standings[match.team1Id].gamesLost;
      standings[match.team1Id].points += team1Points;
      
      if (team1Won) {
        standings[match.team1Id].wins++;
      } else {
        standings[match.team1Id].losses++;
      }
      
      // Update team 2
      standings[match.team2Id].played++;
      standings[match.team2Id].setsWon += team2Sets;
      standings[match.team2Id].setsLost += team1Sets;
      standings[match.team2Id].setDifference = 
        standings[match.team2Id].setsWon - standings[match.team2Id].setsLost;
      standings[match.team2Id].gamesWon += team2GamesTotal;
      standings[match.team2Id].gamesLost += team1GamesTotal;
      standings[match.team2Id].gameDifference = 
        standings[match.team2Id].gamesWon - standings[match.team2Id].gamesLost;
      standings[match.team2Id].points += team2Points;
      
      if (!team1Won) {
        standings[match.team2Id].wins++;
      } else {
        standings[match.team2Id].losses++;
      }
    });

  // Sort by points, then by set difference, then by game difference
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.setDifference !== a.setDifference) return b.setDifference - a.setDifference;
    return b.gameDifference - a.gameDifference;
  });
};

export const validateSetScore = (score1: number, score2: number, setIndex: number = 0): boolean => {
  const maxScore = Math.max(score1, score2);
  const minScore = Math.min(score1, score2);
  
  // 3rd set is a super tiebreak (10 points with 2 point difference, max 22-20)
  if (setIndex === 2) {
    if (maxScore < 10) return false;
    if (maxScore > 22) return false;
    if (minScore < 0 || minScore > 20) return false;
    if (maxScore - minScore < 2) return false; // Must have 2 point difference
    if (maxScore === 22 && minScore !== 20) return false; // Max score is 22-20
    return true;
  }
  
  // First and second sets: normal padel rules (6-7 points)
  if (maxScore < 6 || maxScore > 7) return false;
  if (minScore < 0 || minScore > 6) return false;
  if (maxScore === 6 && minScore === 6) return false; // Must be 7-6 not 6-6
  if (maxScore === 6 && minScore === 5) return false; // Must be 7-5 not 6-5
  if (maxScore === 7 && minScore < 5) return false; // 7 only valid with 5 or 6
  
  return true;
};

export const isMatchComplete = (sets: MatchSet[]): boolean => {
  if (sets.length === 0) return false;
  
  let team1Sets = 0;
  let team2Sets = 0;
  
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    if (!validateSetScore(set.team1Score, set.team2Score, i)) return false;
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
