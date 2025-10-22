import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsersRound, Users } from "lucide-react";

const Groups = () => {
  const { data } = useTournament();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent">
            Gironi
          </h1>
          <p className="text-muted-foreground text-lg">
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
          <div className="grid md:grid-cols-2 gap-6">
            {data.groups.map((group, idx) => {
              const teams = data.teams.filter(t => group.teamIds.includes(t.id));

              return (
                <Card
                  key={group.id}
                  className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader className="bg-gradient-accent text-accent-foreground rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-5 h-5" />
                        {group.name}
                      </div>
                      <Badge variant="secondary" className="bg-white/20">
                        {teams.length} team{teams.length !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {teams.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nessun team in questo girone
                      </p>
                     ) : (
                      <div className="space-y-3">
                        {teams.map((team) => (
                          <div
                            key={team.id}
                            className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <h3 className="font-bold text-lg">{team.name}</h3>
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
