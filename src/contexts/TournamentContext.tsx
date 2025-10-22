import React, { createContext, useContext, useState, useEffect } from "react";
import { TournamentData, Team, Group, Match, Player, MatchSet, BracketMatch } from "@/types/tournament";
import { toast } from "@/hooks/use-toast";

interface TournamentContextType {
  data: TournamentData;
  isAdmin: boolean;
  availableTeams: Team[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addTeam: (name: string, players: Player[]) => void;
  updateTeam: (id: string, name: string, players: Player[]) => void;
  deleteTeam: (id: string) => void;
  addGroup: (name: string, teamIds: string[]) => void;
  updateGroup: (id: string, name: string, teamIds: string[]) => void;
  deleteGroup: (id: string) => void;
  addMatch: (groupId: string, team1Id: string, team2Id: string, date: string, time?: string, giornata?: number) => void;
  updateMatch: (id: string, sets: MatchSet[], completed: boolean, date?: string, time?: string) => void;
  deleteMatch: (id: string) => void;
  updateBracketMatch: (id: string, team1Id: string | null, team2Id: string | null, winnerId: string | null) => void;
  resetBracket: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const STORAGE_KEY = "padel-tournament-data";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

const initializeBracket = (): BracketMatch[] => {
  const bracket: BracketMatch[] = [];
  
  // Quarti (8 teams, 4 matches)
  for (let i = 0; i < 4; i++) {
    bracket.push({
      id: `quarter-${i}`,
      team1Id: null,
      team2Id: null,
      winnerId: null,
      round: "quarter",
      position: i,
    });
  }
  
  // Semifinali (4 teams, 2 matches)
  for (let i = 0; i < 2; i++) {
    bracket.push({
      id: `semi-${i}`,
      team1Id: null,
      team2Id: null,
      winnerId: null,
      round: "semi",
      position: i,
    });
  }
  
  // Finale (2 teams, 1 match)
  bracket.push({
    id: `final-0`,
    team1Id: null,
    team2Id: null,
    winnerId: null,
    round: "final",
    position: 0,
  });
  
  return bracket;
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<TournamentData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Assicurati che bracket esista
        if (!parsed.bracket) {
          parsed.bracket = initializeBracket();
        }
        return parsed;
      } catch {
        return { teams: [], groups: [], matches: [], bracket: initializeBracket() };
      }
    }
    return { teams: [], groups: [], matches: [], bracket: initializeBracket() };
  });

  const [isAdmin, setIsAdmin] = useState(false);

  // Calcola i team disponibili (non assegnati a gironi)
  const availableTeams = data.teams.filter(team => {
    return !data.groups.some(group => group.teamIds.includes(team.id));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      toast({ title: "✅ Login effettuato", description: "Benvenuto Admin!" });
      return true;
    }
    toast({ title: "❌ Login fallito", description: "Credenziali non valide", variant: "destructive" });
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    toast({ title: "👋 Logout effettuato" });
  };

  const addTeam = (name: string, players: Player[]) => {
    const newTeam: Team = {
      id: crypto.randomUUID(),
      name,
      players,
    };
    setData(prev => ({ ...prev, teams: [...prev.teams, newTeam] }));
    toast({ title: "✅ Team aggiunto", description: `${name} è stato creato` });
  };

  const updateTeam = (id: string, name: string, players: Player[]) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(t => (t.id === id ? { ...t, name, players } : t)),
    }));
    toast({ title: "✅ Team aggiornato", description: `${name} è stato modificato` });
  };

  const deleteTeam = (id: string) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== id),
      groups: prev.groups.map(g => ({ ...g, teamIds: g.teamIds.filter(tid => tid !== id) })),
      matches: prev.matches.filter(m => m.team1Id !== id && m.team2Id !== id),
    }));
    toast({ title: "🗑️ Team eliminato" });
  };

  const addGroup = (name: string, teamIds: string[]) => {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      teamIds,
    };
    setData(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));
    toast({ title: "✅ Girone aggiunto", description: `${name} è stato creato` });
  };

  const updateGroup = (id: string, name: string, teamIds: string[]) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => (g.id === id ? { ...g, name, teamIds } : g)),
    }));
    toast({ title: "✅ Girone aggiornato", description: `${name} è stato modificato` });
  };

  const deleteGroup = (id: string) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== id),
      matches: prev.matches.filter(m => m.groupId !== id),
    }));
    toast({ title: "🗑️ Girone eliminato" });
  };

  const addMatch = (groupId: string, team1Id: string, team2Id: string, date: string, time?: string, giornata?: number) => {
    const newMatch: Match = {
      id: crypto.randomUUID(),
      groupId,
      team1Id,
      team2Id,
      date,
      time,
      giornata,
      sets: [],
      completed: false,
    };
    setData(prev => ({ ...prev, matches: [...prev.matches, newMatch] }));
    toast({ title: "✅ Partita aggiunta" });
  };

  const updateMatch = (id: string, sets: MatchSet[], completed: boolean, date?: string, time?: string) => {
    setData(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.id === id 
          ? { 
              ...m, 
              sets, 
              completed,
              ...(date !== undefined && { date }),
              ...(time !== undefined && { time })
            } 
          : m
      ),
    }));
    toast({ title: "✅ Risultato aggiornato", description: "La classifica è stata aggiornata" });
  };

  const deleteMatch = (id: string) => {
    setData(prev => ({
      ...prev,
      matches: prev.matches.filter(m => m.id !== id),
    }));
    toast({ title: "🗑️ Partita eliminata" });
  };

  const updateBracketMatch = (id: string, team1Id: string | null, team2Id: string | null, winnerId: string | null) => {
    setData(prev => {
      const newBracket = prev.bracket.map(match => {
        if (match.id === id) {
          return { ...match, team1Id, team2Id, winnerId };
        }
        return match;
      });

      // Se c'è un vincitore, propagalo al turno successivo
      if (winnerId) {
        const currentMatch = newBracket.find(m => m.id === id);
        if (currentMatch) {
          if (currentMatch.round === "quarter") {
            // Trova la semifinale corrispondente
            const semiIndex = Math.floor(currentMatch.position / 2);
            const semiMatch = newBracket.find(m => m.round === "semi" && m.position === semiIndex);
            if (semiMatch) {
              // Se è la prima partita del quarto, aggiorna team1, altrimenti team2
              if (currentMatch.position % 2 === 0) {
                semiMatch.team1Id = winnerId;
              } else {
                semiMatch.team2Id = winnerId;
              }
            }
          } else if (currentMatch.round === "semi") {
            // Trova la finale
            const finalMatch = newBracket.find(m => m.round === "final");
            if (finalMatch) {
              if (currentMatch.position === 0) {
                finalMatch.team1Id = winnerId;
              } else {
                finalMatch.team2Id = winnerId;
              }
            }
          }
        }
      }

      return { ...prev, bracket: newBracket };
    });
    toast({ title: "✅ Tabellone aggiornato" });
  };

  const resetBracket = () => {
    setData(prev => ({
      ...prev,
      bracket: initializeBracket(),
    }));
    toast({ title: "🔄 Tabellone resettato" });
  };

  return (
    <TournamentContext.Provider
      value={{
        data,
        isAdmin,
        availableTeams,
        login,
        logout,
        addTeam,
        updateTeam,
        deleteTeam,
        addGroup,
        updateGroup,
        deleteGroup,
        addMatch,
        updateMatch,
        deleteMatch,
        updateBracketMatch,
        resetBracket,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error("useTournament must be used within TournamentProvider");
  return context;
};
