import { useState } from "react";
import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, User } from "lucide-react";
import { Player } from "@/types/tournament";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const AdminTeams = () => {
  const { data, addTeam, updateTeam, deleteTeam } = useTournament();
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddPlayer = () => {
    if (playerName.trim()) {
      setPlayers([...players, { id: crypto.randomUUID(), name: playerName.trim() }]);
      setPlayerName("");
    }
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      if (editingTeam) {
        updateTeam(editingTeam, teamName.trim(), players);
        setEditingTeam(null);
      } else {
        addTeam(teamName.trim(), players);
      }
      setTeamName("");
      setPlayers([]);
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (teamId: string) => {
    const team = data.teams.find(t => t.id === teamId);
    if (team) {
      setTeamName(team.name);
      setPlayers(team.players);
      setEditingTeam(teamId);
      setIsDialogOpen(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setTeamName("");
    setPlayers([]);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? "Modifica Team" : "Nuovo Team"}
              </DialogTitle>
              <DialogDescription>
                {editingTeam 
                  ? "Modifica il nome e i giocatori del team" 
                  : "Inserisci il nome del team e aggiungi i giocatori"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Nome Team</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Es: Gli Smasher"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Giocatori</Label>
                <div className="flex gap-2">
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Nome giocatore"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPlayer())}
                  />
                  <Button type="button" onClick={handleAddPlayer} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {players.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{player.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePlayer(player.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 shadow-primary">
                  {editingTeam ? "Aggiorna" : "Crea"} Team
                </Button>
                {editingTeam && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Annulla
                  </Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
          <CardTitle>Tutti i Teams</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {data.teams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun team creato. Aggiungi il primo team!
            </p>
          ) : (
            <div className="space-y-3">
              {data.teams.map((team) => {
                const isAssigned = data.groups.some(group => 
                  group.teamIds.includes(team.id)
                );
                
                return (
                  <div
                    key={team.id}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{team.name}</h3>
                        <Badge variant={isAssigned ? "default" : "secondary"}>
                          {isAssigned ? "Assegnato" : "Disponibile"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(team.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTeam(team.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {team.players.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {team.players.map((player) => (
                          <Badge key={player.id} variant="outline">
                            {player.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
