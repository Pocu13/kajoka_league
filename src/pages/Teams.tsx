import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";

const Teams = () => {
  const { data } = useTournament();

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8 text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent px-2">
            Teams
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {data.teams.map((team, idx) => (
              <Card
                key={team.id}
                className="group shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in border-2 hover:border-primary/50"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="truncate min-w-0">{team.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        {team.players.length} {team.players.length === 1 ? 'Giocatore' : 'Giocatori'}
                      </span>
                    </div>
                    {team.players.length === 0 ? (
                      <p className="text-xs sm:text-sm text-muted-foreground italic py-2">
                        Nessun giocatore
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {team.players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors min-w-0"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="text-xs sm:text-sm font-medium truncate min-w-0">{player.name}</span>
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
