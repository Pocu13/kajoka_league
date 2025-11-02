import { useTournament } from "@/contexts/TournamentContext";
import { calculateStandings } from "@/lib/tournamentLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Standings = () => {
  const { data } = useTournament();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-hero bg-clip-text text-transparent">
            Classifiche per Girone
          </h1>
          <p className="text-muted-foreground text-lg">
            Classifiche aggiornate in tempo reale per ogni girone
          </p>
        </div>

        {data.groups.length === 0 ? (
          <Card className="shadow-card animate-scale-in">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Nessun girone disponibile
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {[...data.groups].sort((a, b) => a.name.localeCompare(b.name)).map((group, idx) => {
              const standings = calculateStandings(data.matches, data.teams, group.id);

              return (
                <Card
                  key={group.id}
                  className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        {group.name}
                      </div>
                      <Badge variant="secondary" className="bg-white/20">
                        {standings.length} team{standings.length !== 1 ? "s" : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {standings.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nessun team in questo girone
                      </p>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block rounded-lg border border-border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="w-12 text-center font-bold">#</TableHead>
                                <TableHead className="font-bold">Team</TableHead>
                                <TableHead className="text-center font-bold">PT</TableHead>
                                <TableHead className="text-center font-bold">PG</TableHead>
                                <TableHead className="text-center font-bold">V</TableHead>
                                <TableHead className="text-center font-bold">P</TableHead>
                                <TableHead className="text-center font-bold">Diff Set</TableHead>
                                <TableHead className="text-center font-bold">Diff Game</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {standings.map((standing, position) => (
                                <TableRow
                                  key={standing.teamId}
                                  className="hover:bg-muted/30 transition-colors"
                                >
                                  <TableCell className="text-center font-bold">
                                    <div className="flex items-center justify-center gap-1">
                                      {position < 3 && (
                                        <Trophy
                                          className={`w-4 h-4 ${
                                            position === 0
                                              ? "text-yellow-500"
                                              : position === 1
                                              ? "text-gray-400"
                                              : "text-orange-600"
                                          }`}
                                        />
                                      )}
                                      {position + 1}
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold">
                                    {standing.teamName}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <TrendingUp className="w-4 h-4 text-primary" />
                                      <span className="font-bold text-primary text-lg">
                                        {standing.points}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center font-medium">
                                    {standing.played}
                                  </TableCell>
                                  <TableCell className="text-center font-medium text-green-600">
                                    {standing.wins}
                                  </TableCell>
                                  <TableCell className="text-center font-medium text-red-600">
                                    {standing.losses}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant={standing.setDifference >= 0 ? "default" : "secondary"}
                                      className="font-semibold"
                                    >
                                      {standing.setDifference >= 0 ? "+" : ""}
                                      {standing.setDifference}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant={standing.gameDifference >= 0 ? "default" : "secondary"}
                                      className="font-semibold"
                                    >
                                      {standing.gameDifference >= 0 ? "+" : ""}
                                      {standing.gameDifference}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                          {standings.map((standing, position) => (
                            <div
                              key={standing.teamId}
                              className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary">
                                    {position + 1}
                                  </div>
                                  {position < 3 && (
                                    <Trophy
                                      className={`w-5 h-5 ${
                                        position === 0
                                          ? "text-yellow-500"
                                          : position === 1
                                          ? "text-gray-400"
                                          : "text-orange-600"
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Badge
                                    variant={standing.setDifference >= 0 ? "default" : "secondary"}
                                    className="font-semibold text-xs"
                                  >
                                    Set: {standing.setDifference >= 0 ? "+" : ""}
                                    {standing.setDifference}
                                  </Badge>
                                  <Badge
                                    variant={standing.gameDifference >= 0 ? "default" : "secondary"}
                                    className="font-semibold text-xs"
                                  >
                                    Game: {standing.gameDifference >= 0 ? "+" : ""}
                                    {standing.gameDifference}
                                  </Badge>
                                </div>
                              </div>
                              
                              <h3 className="font-bold text-lg mb-3">{standing.teamName}</h3>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col items-center p-2 rounded bg-primary/10">
                                  <span className="text-xs text-muted-foreground mb-1">Punti</span>
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <span className="font-bold text-primary text-xl">
                                      {standing.points}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-center p-2 rounded bg-muted/50">
                                  <span className="text-xs text-muted-foreground mb-1">Giocate</span>
                                  <span className="font-bold text-lg">{standing.played}</span>
                                </div>
                                
                                <div className="flex flex-col items-center p-2 rounded bg-green-500/10">
                                  <span className="text-xs text-muted-foreground mb-1">Vinte</span>
                                  <span className="font-bold text-lg text-green-600">
                                    {standing.wins}
                                  </span>
                                </div>
                                
                                <div className="flex flex-col items-center p-2 rounded bg-red-500/10">
                                  <span className="text-xs text-muted-foreground mb-1">Perse</span>
                                  <span className="font-bold text-lg text-red-600">
                                    {standing.losses}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
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

export default Standings;
