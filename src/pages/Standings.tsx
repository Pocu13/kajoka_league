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
                      <div className="rounded-lg border border-border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-8 md:w-12 text-center font-bold text-xs md:text-sm px-1 md:px-4">#</TableHead>
                              <TableHead className="font-bold text-xs md:text-sm px-2 md:px-4">Team</TableHead>
                              <TableHead className="text-center font-bold text-xs md:text-sm px-1 md:px-4">PT</TableHead>
                              <TableHead className="text-center font-bold text-xs md:text-sm px-1 md:px-4">PG</TableHead>
                              <TableHead className="text-center font-bold text-xs md:text-sm px-1 md:px-4">V</TableHead>
                              <TableHead className="text-center font-bold text-xs md:text-sm px-1 md:px-4">P</TableHead>
                              <TableHead className="text-center font-bold text-xs md:text-sm px-1 md:px-4">D.S</TableHead>
                              <TableHead className="text-center font-bold text-xs md:text-sm px-1 md:px-4">D.G</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {standings.map((standing, position) => (
                              <TableRow
                                key={standing.teamId}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="text-center font-bold px-1 md:px-4 py-2 md:py-4">
                                  <div className="flex items-center justify-center gap-0.5 md:gap-1">
                                    {position < 3 && (
                                      <Trophy
                                        className={`w-3 h-3 md:w-4 md:h-4 ${
                                          position === 0
                                            ? "text-yellow-500"
                                            : position === 1
                                            ? "text-gray-400"
                                            : "text-orange-600"
                                        }`}
                                      />
                                    )}
                                    <span className="text-xs md:text-base">{position + 1}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold px-2 md:px-4 py-2 md:py-4 text-xs md:text-base">
                                  {standing.teamName}
                                </TableCell>
                                <TableCell className="text-center px-1 md:px-4 py-2 md:py-4">
                                  <div className="flex items-center justify-center gap-0.5 md:gap-1">
                                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                                    <span className="font-bold text-primary text-sm md:text-lg">
                                      {standing.points}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-medium px-1 md:px-4 py-2 md:py-4 text-xs md:text-base">
                                  {standing.played}
                                </TableCell>
                                <TableCell className="text-center font-medium text-green-600 px-1 md:px-4 py-2 md:py-4 text-xs md:text-base">
                                  {standing.wins}
                                </TableCell>
                                <TableCell className="text-center font-medium text-red-600 px-1 md:px-4 py-2 md:py-4 text-xs md:text-base">
                                  {standing.losses}
                                </TableCell>
                                <TableCell className="text-center px-1 md:px-4 py-2 md:py-4">
                                  <Badge
                                    variant={standing.setDifference >= 0 ? "default" : "secondary"}
                                    className="font-semibold text-xs"
                                  >
                                    {standing.setDifference >= 0 ? "+" : ""}
                                    {standing.setDifference}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center px-1 md:px-4 py-2 md:py-4">
                                  <Badge
                                    variant={standing.gameDifference >= 0 ? "default" : "secondary"}
                                    className="font-semibold text-xs"
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
