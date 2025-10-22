import { useState } from "react";
import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const AdminGroups = () => {
  const { data, availableTeams, addGroup, updateGroup, deleteGroup } = useTournament();
  const [groupName, setGroupName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && selectedTeams.length > 0) {
      if (editingGroup) {
        updateGroup(editingGroup, groupName.trim(), selectedTeams);
        setEditingGroup(null);
      } else {
        addGroup(groupName.trim(), selectedTeams);
      }
      setGroupName("");
      setSelectedTeams([]);
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (groupId: string) => {
    const group = data.groups.find(g => g.id === groupId);
    if (group) {
      setGroupName(group.name);
      setSelectedTeams(group.teamIds);
      setEditingGroup(groupId);
      setIsDialogOpen(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setGroupName("");
    setSelectedTeams([]);
    setIsDialogOpen(false);
  };

  const handleTeamToggle = (teamId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeams([...selectedTeams, teamId]);
    } else {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Girone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Modifica Girone" : "Nuovo Girone"}
              </DialogTitle>
              <DialogDescription>
                {editingGroup 
                  ? "Modifica il nome e i team del girone" 
                  : "Inserisci il nome del girone e seleziona i team"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Nome Girone</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Es: Girone A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Seleziona Teams</Label>
                {availableTeams.length === 0 && !editingGroup ? (
                  <p className="text-sm text-muted-foreground">
                    Nessun team disponibile. Tutti i team sono già assegnati a gironi!
                  </p>
                ) : (
                  <div className="space-y-2 border rounded-lg p-3 max-h-[300px] overflow-y-auto">
                    {/* Mostra team disponibili + team già nel girone (se editingGroup) */}
                    {(editingGroup 
                      ? [...availableTeams, ...data.teams.filter(t => selectedTeams.includes(t.id))]
                      : availableTeams
                    ).map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={selectedTeams.includes(team.id)}
                          onCheckedChange={(checked) => handleTeamToggle(team.id, checked as boolean)}
                        />
                        <label
                          htmlFor={`team-${team.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {team.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTeams.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedTeams.length} team selezionati
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 shadow-primary"
                  disabled={selectedTeams.length === 0}
                >
                  {editingGroup ? "Aggiorna" : "Crea"} Girone
                </Button>
                {editingGroup && (
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
          <CardTitle>Gironi Esistenti</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {data.groups.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun girone creato
            </p>
          ) : (
            <div className="space-y-3">
              {data.groups.map((group) => {
                const teams = data.teams.filter(t => group.teamIds.includes(t.id));
                return (
                  <div
                    key={group.id}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{group.name}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(group.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGroup(group.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {teams.map(t => t.name).join(", ")}
                    </div>
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
