import { useState } from "react";
import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save, Sparkles } from "lucide-react";
import { MatchSet } from "@/types/tournament";
import { validateSetScore, isMatchComplete } from "@/lib/tournamentLogic";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const AdminMatches = () => {
  const { data, addMatch, updateMatch, deleteMatch } = useTournament();
  const [groupId, setGroupId] = useState("");
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [date, setDate] = useState("");
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [sets, setSets] = useState<MatchSet[]>([]);
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedGroupForGeneration, setSelectedGroupForGeneration] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupId && team1Id && team2Id && date && team1Id !== team2Id) {
      addMatch(groupId, team1Id, team2Id, date);
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const resetForm = () => {
    setGroupId("");
    setTeam1Id("");
    setTeam2Id("");
    setDate("");
  };

  const handleEditMatch = (matchId: string) => {
    const match = data.matches.find(m => m.id === matchId);
    if (match) {
      setEditingMatchId(matchId);
      setSets(match.sets.length > 0 ? match.sets : [{ team1Score: -1, team2Score: -1 }]);
      setEditDate(match.date ? new Date(match.date) : undefined);
      setEditTime(match.time || "");
      setIsEditDialogOpen(true);
    }
  };

  const handleAddSet = () => {
    if (sets.length < 3) {
      setSets([...sets, { team1Score: -1, team2Score: -1 }]);
    }
  };

  const handleSetChange = (index: number, team: 1 | 2, value: string) => {
    const score = parseInt(value) || 0;
    const newSets = [...sets];
    if (team === 1) {
      newSets[index].team1Score = score;
    } else {
      newSets[index].team2Score = score;
    }
    setSets(newSets);
  };

  const handleSaveResult = () => {
    if (!editingMatchId) return;

    const validSets = sets.filter(s => 
      s.team1Score >= 0 && s.team2Score >= 0 && validateSetScore(s.team1Score, s.team2Score)
    );

    const completed = validSets.length > 0 && isMatchComplete(validSets);
    const dateStr = editDate ? editDate.toISOString() : "";
    
    updateMatch(editingMatchId, validSets, completed, dateStr, editTime);
    
    toast({
      title: "Risultato salvato",
      description: "La partita è stata aggiornata con successo",
    });
    
    setEditingMatchId(null);
    setSets([]);
    setEditDate(undefined);
    setEditTime("");
    setIsEditDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingMatchId(null);
    setSets([]);
    setEditDate(undefined);
    setEditTime("");
    setIsEditDialogOpen(false);
  };

  const handleGenerateMatches = () => {
    if (!selectedGroupForGeneration) return;

    const group = data.groups.find(g => g.id === selectedGroupForGeneration);
    if (!group) return;

    const teamsInSelectedGroup = data.teams.filter(t => group.teamIds.includes(t.id));
    
    if (teamsInSelectedGroup.length < 2) {
      toast({
        title: "Errore",
        description: "Il girone deve avere almeno 2 team per generare le partite",
        variant: "destructive",
      });
      return;
    }

    // Generate round-robin matches with giornate
    const allMatches: Array<{ team1: string; team2: string }> = [];
    
    for (let i = 0; i < teamsInSelectedGroup.length; i++) {
      for (let j = i + 1; j < teamsInSelectedGroup.length; j++) {
        allMatches.push({
          team1: teamsInSelectedGroup[i].id,
          team2: teamsInSelectedGroup[j].id
        });
      }
    }

    // Distribute matches into giornate using round-robin algorithm
    const numTeams = teamsInSelectedGroup.length;
    const numRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
    const matchesByRound: Array<Array<{ team1: string; team2: string }>> = Array.from({ length: numRounds }, () => []);
    
    // Round-robin scheduling algorithm
    const teams = teamsInSelectedGroup.map(t => t.id);
    if (teams.length % 2 !== 0) {
      teams.push("BYE"); // Add dummy for odd number of teams
    }
    
    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < teams.length / 2; i++) {
        const team1 = teams[i];
        const team2 = teams[teams.length - 1 - i];
        
        if (team1 !== "BYE" && team2 !== "BYE") {
          matchesByRound[round].push({ team1, team2 });
        }
      }
      
      // Rotate teams (keep first team fixed)
      teams.splice(1, 0, teams.pop()!);
    }

    let generatedCount = 0;
    
    matchesByRound.forEach((roundMatches, roundIndex) => {
      roundMatches.forEach(match => {
        // Check if match already exists
        const matchExists = data.matches.some(
          m => m.groupId === selectedGroupForGeneration &&
          ((m.team1Id === match.team1 && m.team2Id === match.team2) ||
           (m.team1Id === match.team2 && m.team2Id === match.team1))
        );
        
        if (!matchExists) {
          addMatch(selectedGroupForGeneration, match.team1, match.team2, "", undefined, roundIndex + 1);
          generatedCount++;
        }
      });
    });

    toast({
      title: "Partite generate!",
      description: `${generatedCount} partite distribuite in ${numRounds} giornate per ${group.name}`,
    });

    setIsGenerateDialogOpen(false);
    setSelectedGroupForGeneration("");
  };

  const teamsInGroup = groupId 
    ? data.teams.filter(t => {
        const group = data.groups.find(g => g.id === groupId);
        return group?.teamIds.includes(t.id);
      })
    : [];

  // Group matches by group and then by giornata
  const matchesByGroup = data.groups.map(group => {
    const groupMatches = data.matches.filter(m => m.groupId === group.id);
    
    // Group by giornata
    const giornate = new Map<number, typeof groupMatches>();
    groupMatches.forEach(match => {
      const giornata = match.giornata || 0;
      if (!giornate.has(giornata)) {
        giornate.set(giornata, []);
      }
      giornate.get(giornata)!.push(match);
    });
    
    return {
      group,
      giornate: Array.from(giornate.entries()).sort((a, b) => a[0] - b[0])
    };
  }).filter(g => g.giornate.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Partita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuova Partita</DialogTitle>
              <DialogDescription>
                Seleziona il girone, i team e la data della partita
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Girone</Label>
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona girone" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Team 1</Label>
                  <Select value={team1Id} onValueChange={setTeam1Id} disabled={!groupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamsInGroup.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Team 2</Label>
                  <Select value={team2Id} onValueChange={setTeam2Id} disabled={!groupId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamsInGroup.filter(t => t.id !== team1Id).map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data e Ora</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full shadow-primary">
                Aggiungi Partita
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="shadow-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Genera Partite
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Genera Partite Automaticamente</DialogTitle>
              <DialogDescription>
                Seleziona un girone per generare tutte le partite round-robin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Girone</Label>
                <Select 
                  value={selectedGroupForGeneration} 
                  onValueChange={setSelectedGroupForGeneration}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona girone" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGenerateMatches} 
                className="w-full shadow-primary"
                disabled={!selectedGroupForGeneration}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Genera
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Match Result Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inserisci Risultato</DialogTitle>
            <DialogDescription>
              Aggiungi punteggi, data e ora della partita (opzionali)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Set giocati */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Set Giocati</Label>
              <div className="space-y-3">
                {sets.map((set, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium min-w-[60px]">Set {idx + 1}:</span>
                    <Select 
                      value={set.team1Score < 0 ? "-1" : set.team1Score.toString()} 
                      onValueChange={(value) => handleSetChange(idx, 1, value)}
                    >
                      <SelectTrigger className="w-20 font-semibold">
                        <SelectValue>
                          {set.team1Score < 0 ? "-" : set.team1Score}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1" className="font-medium text-muted-foreground">
                          -
                        </SelectItem>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((score) => (
                          <SelectItem 
                            key={score} 
                            value={score.toString()}
                            className="font-medium"
                          >
                            {score}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-lg font-bold">-</span>
                    <Select 
                      value={set.team2Score < 0 ? "-1" : set.team2Score.toString()} 
                      onValueChange={(value) => handleSetChange(idx, 2, value)}
                    >
                      <SelectTrigger className="w-20 font-semibold">
                        <SelectValue>
                          {set.team2Score < 0 ? "-" : set.team2Score}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1" className="font-medium text-muted-foreground">
                          -
                        </SelectItem>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((score) => (
                          <SelectItem 
                            key={score} 
                            value={score.toString()}
                            className="font-medium"
                          >
                            {score}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Pulsanti */}
            <div className="flex flex-wrap gap-2 pt-2">
              {sets.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSet}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Set
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSaveResult}
                className="shadow-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Salva
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelEdit}
              >
                Annulla
              </Button>
            </div>

            {/* Date e Time pickers */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Data (opzionale)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDate ? format(editDate, "PPP", { locale: undefined }) : "Seleziona data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-time">Ora (opzionale)</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {matchesByGroup.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              Nessuna partita programmata
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matchesByGroup.map(({ group, giornate }) => (
            <Card key={group.id} className="shadow-card">
              <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  {group.name}
                  <Badge variant="secondary" className="ml-auto">
                    {giornate.reduce((sum, [, matches]) => sum + matches.length, 0)} partite
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {giornate.map(([giornataNum, matches]) => (
                    <div key={giornataNum} className="space-y-3">
                      {giornataNum > 0 && (
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Badge variant="outline">Giornata {giornataNum}</Badge>
                        </h3>
                      )}
                      <div className="space-y-3">
                         {matches.map((match) => {
                          const team1 = data.teams.find(t => t.id === match.team1Id);
                          const team2 = data.teams.find(t => t.id === match.team2Id);

                          return (
                            <div
                              key={match.id}
                              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={match.completed ? "default" : "secondary"}>
                                      {match.completed ? "Completata" : "Da giocare"}
                                    </Badge>
                                  </div>
                                  <p className="font-bold">
                                    {team1?.name} vs {team2?.name}
                                  </p>
                                  {match.date && (
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(match.date).toLocaleDateString("it-IT")}
                                      {match.time && ` - ${match.time}`}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditMatch(match.id)}
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteMatch(match.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {match.sets.length > 0 && (
                                <div className="mt-2 flex gap-2">
                                  {match.sets.map((set, i) => (
                                    <Badge key={i} variant="outline">
                                      {set.team1Score}-{set.team2Score}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
