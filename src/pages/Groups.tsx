import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsersRound, Users } from "lucide-react";

const Groups = () => {
  const { data } = useTournament();

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8 text-center animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent px-2">
            Gironi
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
            Composizione dei gironi del torneo
          </p>
        </div>

        {data.groups.length === 0 ? (
          <Card className="shadow-card animate-scale-in">
            <CardContent className="p-12 text-center">
              <UsersRound className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Nessun girone disponibile. Vai nell'area Admin per creare gironi!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {data.groups.map((group, idx) => {
              const teams = data.teams.filter(t => group.teamIds.includes(t.id));

              return (
                <Card
                  key={group.id}
                  className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader className="bg-gradient-accent text-accent-foreground rounded-t-lg p-4 sm:p-6">
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="text-base sm:text-lg">{group.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-xs sm:text-sm">
                        {teams.length} team{teams.length !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                    {teams.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
                        Nessun team in questo girone
                      </p>
                     ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {teams.map((team) => (
                          <div
                            key={team.id}
                            className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              </div>
                              <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">{team.name}</h3>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
