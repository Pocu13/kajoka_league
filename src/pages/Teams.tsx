import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";

const Teams = () => {
  const { data } = useTournament();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent">
            Teams
          </h1>
          <p className="text-muted-foreground text-lg">
            Tutti i team del torneo
          </p>
        </div>

        {data.teams.length === 0 ? (
          <Card className="shadow-card animate-scale-in">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Nessun team disponibile. Vai nell'area Admin per creare team!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.teams.map((team, idx) => (
              <Card
                key={team.id}
                className="group shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in border-2 hover:border-primary/50"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span className="truncate">{team.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        {team.players.length} {team.players.length === 1 ? 'Giocatore' : 'Giocatori'}
                      </span>
                    </div>
                    {team.players.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-2">
                        Nessun giocatore
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {team.players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-sm font-medium truncate">{player.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
