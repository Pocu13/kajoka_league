import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, RotateCcw } from "lucide-react";
import { BracketMatch } from "@/types/tournament";

export const AdminBrackets = () => {
  const { data, updateBracketMatch, resetBracket } = useTournament();

  const quarters = data.bracket.filter(m => m.round === "quarter");
  const semis = data.bracket.filter(m => m.round === "semi");
  const final = data.bracket.find(m => m.round === "final");

  const handleTeamSelect = (matchId: string, position: "team1" | "team2", teamId: string) => {
    const match = data.bracket.find(m => m.id === matchId);
    if (!match) return;

    const newTeam1Id = position === "team1" ? teamId : match.team1Id;
    const newTeam2Id = position === "team2" ? teamId : match.team2Id;

    updateBracketMatch(matchId, newTeam1Id, newTeam2Id, match.winnerId);
  };

  const handleWinnerSelect = (matchId: string, winnerId: string) => {
    const match = data.bracket.find(m => m.id === matchId);
    if (!match) return;

    updateBracketMatch(matchId, match.team1Id, match.team2Id, winnerId);
  };

  const renderMatch = (match: BracketMatch | undefined, title: string) => {
    if (!match) return null;

    const team1 = data.teams.find(t => t.id === match.team1Id);
    const team2 = data.teams.find(t => t.id === match.team2Id);
    const canSelectWinner = match.team1Id && match.team2Id;

    return (
      <Card className="shadow-card hover:shadow-card-hover transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Select
              value={match.team1Id || ""}
              onValueChange={(value) => handleTeamSelect(match.id, "team1", value)}
            >
              <SelectTrigger className={match.winnerId === match.team1Id ? "ring-2 ring-primary" : ""}>
                <SelectValue placeholder="Seleziona Team 1" />
              </SelectTrigger>
              <SelectContent>
                {data.teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-center text-sm font-bold text-muted-foreground">VS</div>

            <Select
              value={match.team2Id || ""}
              onValueChange={(value) => handleTeamSelect(match.id, "team2", value)}
            >
              <SelectTrigger className={match.winnerId === match.team2Id ? "ring-2 ring-primary" : ""}>
                <SelectValue placeholder="Seleziona Team 2" />
              </SelectTrigger>
              <SelectContent>
                {data.teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canSelectWinner && (
            <div className="pt-2 border-t border-border">
              <Select
                value={match.winnerId || ""}
                onValueChange={(value) => handleWinnerSelect(match.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona vincitore" />
                </SelectTrigger>
                <SelectContent>
                  {team1 && (
                    <SelectItem value={team1.id}>
                      🏆 {team1.name}
                    </SelectItem>
                  )}
                  {team2 && (
                    <SelectItem value={team2.id}>
                      🏆 {team2.name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tabellone Eliminazione Diretta</h2>
          <p className="text-muted-foreground">
            Gestisci il tabellone a eliminazione diretta del torneo
          </p>
        </div>
        <Button onClick={resetBracket} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Tabellone
        </Button>
      </div>

      {/* Quarti di finale */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Quarti di Finale</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarters.map((match, idx) => renderMatch(match, `Quarto ${idx + 1}`))}
        </div>
      </div>

      {/* Semifinali */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Semifinali</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {semis.map((match, idx) => renderMatch(match, `Semifinale ${idx + 1}`))}
        </div>
      </div>

      {/* Finale */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Finale</h3>
        </div>
        <div className="max-w-md mx-auto">
          {renderMatch(final, "Finale")}
        </div>
      </div>

      {final?.winnerId && (
        <Card className="max-w-md mx-auto shadow-card bg-gradient-accent text-accent-foreground animate-scale-in">
          <CardContent className="p-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Vincitore del Torneo</h3>
            <p className="text-3xl font-bold">
              {data.teams.find(t => t.id === final.winnerId)?.name}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
