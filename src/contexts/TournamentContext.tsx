import React, { createContext, useContext, useState, useEffect } from "react";
import { TournamentData, Team, Group, Match, Player, MatchSet, BracketMatch } from "@/types/tournament";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface TournamentContextType {
  data: TournamentData;
  isAdmin: boolean;
  availableTeams: Team[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addTeam: (name: string, players: Player[]) => Promise<void>;
  updateTeam: (id: string, name: string, players: Player[]) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addGroup: (name: string, teamIds: string[]) => Promise<void>;
  updateGroup: (id: string, name: string, teamIds: string[]) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addMatch: (groupId: string, team1Id: string, team2Id: string, date: string, time?: string, giornata?: number) => Promise<void>;
  updateMatch: (id: string, sets: MatchSet[], completed: boolean, date?: string, time?: string) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  updateBracketMatch: (id: string, team1Id: string | null, team2Id: string | null, winnerId: string | null) => Promise<void>;
  resetBracket: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";

const initializeBracket = (): BracketMatch[] => {
  const bracket: BracketMatch[] = [];
  
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
  const [data, setData] = useState<TournamentData>({
    teams: [],
    groups: [],
    matches: [],
    bracket: initializeBracket(),
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const availableTeams = data.teams.filter(team => {
    return !data.groups.some(group => group.teamIds.includes(team.id));
  });

  // Funzione per caricare tutti i dati da Supabase
  const refreshData = async () => {
    try {
      // Carica Teams con Players
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*, players(*)');
      
      if (teamsError) throw teamsError;

      const teams: Team[] = (teamsData || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        players: (team.players || []).map((player: any) => ({
          id: player.id,
          name: player.name,
        })),
      }));

      // Carica Groups con team IDs
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*, group_teams(team_id)');
      
      if (groupsError) throw groupsError;

      const groups: Group[] = (groupsData || []).map((group: any) => ({
        id: group.id,
        name: group.name,
        teamIds: (group.group_teams || []).map((gt: any) => gt.team_id),
      }));

      // Carica Matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*');
      
      if (matchesError) throw matchesError;

      const matches: Match[] = (matchesData || []).map((match: any) => ({
        id: match.id,
        groupId: match.group_id,
        team1Id: match.team1_id,
        team2Id: match.team2_id,
        date: match.date,
        time: match.time,
        giornata: match.giornata,
        sets: match.sets || [],
        completed: match.completed,
      }));

      // Carica Bracket
      const { data: bracketData, error: bracketError } = await supabase
        .from('bracket_matches')
        .select('*')
        .order('position');
      
      if (bracketError) throw bracketError;

      let bracket: BracketMatch[];
      if (!bracketData || bracketData.length === 0) {
        // Se non ci sono dati, inizializza il bracket
        bracket = initializeBracket();
        // Salva il bracket iniziale nel database
        const { error: insertError } = await supabase
          .from('bracket_matches')
          .insert(bracket.map(match => ({
            id: match.id,
            team1_id: match.team1Id,
            team2_id: match.team2Id,
            winner_id: match.winnerId,
            round: match.round,
            position: match.position,
          })));
        if (insertError) console.error('Error initializing bracket:', insertError);
      } else {
        bracket = bracketData.map((match: any) => ({
          id: match.id,
          team1Id: match.team1_id,
          team2Id: match.team2_id,
          winnerId: match.winner_id,
          round: match.round,
          position: match.position,
        }));
      }

      setData({ teams, groups, matches, bracket });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ 
        title: "❌ Errore di caricamento", 
        description: "Impossibile caricare i dati dal database",
        variant: "destructive" 
      });
    }
  };

  // Carica i dati all'avvio
  useEffect(() => {
    refreshData();
  }, []);

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

  const addTeam = async (name: string, players: Player[]) => {
    try {
      // Inserisci il team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({ name })
        .select()
        .single();
      
      if (teamError) throw teamError;

      // Inserisci i players
      if (players.length > 0) {
        const { error: playersError } = await supabase
          .from('players')
          .insert(players.map(player => ({
            team_id: newTeam.id,
            name: player.name,
          })));
        
        if (playersError) throw playersError;
      }

      await refreshData();
      toast({ title: "✅ Team aggiunto", description: `${name} è stato creato` });
    } catch (error) {
      console.error('Error adding team:', error);
      toast({ title: "❌ Errore", description: "Impossibile aggiungere il team", variant: "destructive" });
    }
  };

  const updateTeam = async (id: string, name: string, players: Player[]) => {
    try {
      // Aggiorna il team
      const { error: teamError } = await supabase
        .from('teams')
        .update({ name })
        .eq('id', id);
      
      if (teamError) throw teamError;

      // Elimina i vecchi players
      await supabase.from('players').delete().eq('team_id', id);

      // Inserisci i nuovi players
      if (players.length > 0) {
        const { error: playersError } = await supabase
          .from('players')
          .insert(players.map(player => ({
            team_id: id,
            name: player.name,
          })));
        
        if (playersError) throw playersError;
      }

      await refreshData();
      toast({ title: "✅ Team aggiornato", description: `${name} è stato modificato` });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({ title: "❌ Errore", description: "Impossibile aggiornare il team", variant: "destructive" });
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      await refreshData();
      toast({ title: "🗑️ Team eliminato" });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({ title: "❌ Errore", description: "Impossibile eliminare il team", variant: "destructive" });
    }
  };

  const addGroup = async (name: string, teamIds: string[]) => {
    try {
      // Inserisci il gruppo
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({ name })
        .select()
        .single();
      
      if (groupError) throw groupError;

      // Inserisci le relazioni gruppo-team
      if (teamIds.length > 0) {
        const { error: relError } = await supabase
          .from('group_teams')
          .insert(teamIds.map(teamId => ({
            group_id: newGroup.id,
            team_id: teamId,
          })));
        
        if (relError) throw relError;
      }

      await refreshData();
      toast({ title: "✅ Girone aggiunto", description: `${name} è stato creato` });
    } catch (error) {
      console.error('Error adding group:', error);
      toast({ title: "❌ Errore", description: "Impossibile aggiungere il girone", variant: "destructive" });
    }
  };

  const updateGroup = async (id: string, name: string, teamIds: string[]) => {
    try {
      // Aggiorna il gruppo
      const { error: groupError } = await supabase
        .from('groups')
        .update({ name })
        .eq('id', id);
      
      if (groupError) throw groupError;

      // Elimina le vecchie relazioni
      await supabase.from('group_teams').delete().eq('group_id', id);

      // Inserisci le nuove relazioni
      if (teamIds.length > 0) {
        const { error: relError } = await supabase
          .from('group_teams')
          .insert(teamIds.map(teamId => ({
            group_id: id,
            team_id: teamId,
          })));
        
        if (relError) throw relError;
      }

      await refreshData();
      toast({ title: "✅ Girone aggiornato", description: `${name} è stato modificato` });
    } catch (error) {
      console.error('Error updating group:', error);
      toast({ title: "❌ Errore", description: "Impossibile aggiornare il girone", variant: "destructive" });
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      await refreshData();
      toast({ title: "🗑️ Girone eliminato" });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({ title: "❌ Errore", description: "Impossibile eliminare il girone", variant: "destructive" });
    }
  };

  const addMatch = async (
    groupId: string, 
    team1Id: string, 
    team2Id: string, 
    date: string, 
    time?: string, 
    giornata?: number
  ) => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert({
          group_id: groupId,
          team1_id: team1Id,
          team2_id: team2Id,
          date,
          time,
          giornata,
          sets: [],
          completed: false,
        });
      
      if (error) throw error;

      await refreshData();
      toast({ title: "✅ Partita aggiunta" });
    } catch (error) {
      console.error('Error adding match:', error);
      toast({ title: "❌ Errore", description: "Impossibile aggiungere la partita", variant: "destructive" });
    }
  };

  const updateMatch = async (
    id: string, 
    sets: MatchSet[], 
    completed: boolean, 
    date?: string, 
    time?: string
  ) => {
    try {
      const updateData: any = { sets, completed };
      if (date !== undefined) updateData.date = date;
      if (time !== undefined) updateData.time = time;

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;

      await refreshData();
      toast({ title: "✅ Risultato aggiornato", description: "La classifica è stata aggiornata" });
    } catch (error) {
      console.error('Error updating match:', error);
      toast({ title: "❌ Errore", description: "Impossibile aggiornare la partita", variant: "destructive" });
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      await refreshData();
      toast({ title: "🗑️ Partita eliminata" });
    } catch (error) {
      console.error('Error deleting match:', error);
      toast({ title: "❌ Errore", description: "Impossibile eliminare la partita", variant: "destructive" });
    }
  };

  const updateBracketMatch = async (
    id: string, 
    team1Id: string | null, 
    team2Id: string | null, 
    winnerId: string | null
  ) => {
    try {
      // Aggiorna il match corrente
      const { error: updateError } = await supabase
        .from('bracket_matches')
        .update({
          team1_id: team1Id,
          team2_id: team2Id,
          winner_id: winnerId,
        })
        .eq('id', id);
      
      if (updateError) throw updateError;

      // Se c'è un vincitore, propaga al turno successivo
      if (winnerId) {
        const currentMatch = data.bracket.find(m => m.id === id);
        if (currentMatch) {
          if (currentMatch.round === "quarter") {
            const semiIndex = Math.floor(currentMatch.position / 2);
            const semiId = `semi-${semiIndex}`;
            const field = currentMatch.position % 2 === 0 ? 'team1_id' : 'team2_id';
            
            await supabase
              .from('bracket_matches')
              .update({ [field]: winnerId })
              .eq('id', semiId);
              
          } else if (currentMatch.round === "semi") {
            const field = currentMatch.position === 0 ? 'team1_id' : 'team2_id';
            
            await supabase
              .from('bracket_matches')
              .update({ [field]: winnerId })
              .eq('id', 'final-0');
          }
        }
      }

      await refreshData();
      toast({ title: "✅ Tabellone aggiornato" });
    } catch (error) {
      console.error('Error updating bracket match:', error);
      toast({ title: "❌ Errore", description: "Impossibile aggiornare il tabellone", variant: "destructive" });
    }
  };

  const resetBracket = async () => {
    try {
      // Elimina tutti i bracket matches esistenti
      await supabase.from('bracket_matches').delete().neq('id', '');

      // Reinserisce il bracket vuoto
      const newBracket = initializeBracket();
      const { error } = await supabase
        .from('bracket_matches')
        .insert(newBracket.map(match => ({
          id: match.id,
          team1_id: match.team1Id,
          team2_id: match.team2Id,
          winner_id: match.winnerId,
          round: match.round,
          position: match.position,
        })));
      
      if (error) throw error;

      await refreshData();
      toast({ title: "🔄 Tabellone resettato" });
    } catch (error) {
      console.error('Error resetting bracket:', error);
      toast({ title: "❌ Errore", description: "Impossibile resettare il tabellone", variant: "destructive" });
    }
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
        refreshData,
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
