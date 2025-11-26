import { useTournament } from "@/contexts/TournamentContext";
import { calculateStandings } from "@/lib/tournamentLogic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Calendar as CalendarIcon, Users, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const Home = () => {
  const { data } = useTournament();

  // Get all standings from all groups
  const allStandings = data.groups.flatMap(group => {
    const standings = calculateStandings(data.matches, data.teams, group.id);
    return standings.map(s => ({ ...s, groupName: group.name }));
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.setDifference - a.setDifference;
  }).slice(0, 8); // Top 8 teams

  // Get latest completed matches
  const latestMatches = [...data.matches]
    .filter(m => m.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 text-center animate-fade-in">
          <div className="inline-block p-2 sm:p-3 rounded-full bg-primary/10 mb-3 sm:mb-4 animate-pulse-glow">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-hero bg-clip-text text-transparent px-2">
            Kajoka League 3.0
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mt-2 px-4">
            Segui in tempo reale le classifiche, i risultati e le prossime partite del torneo
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <Card className="shadow-card hover:shadow-card-hover transition-all border-2 border-primary/20">
            <CardContent className="p-3 sm:p-4 md:p-6 text-center">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-primary" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{data.teams.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Teams</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-card-hover transition-all border-2 border-primary/20">
            <CardContent className="p-3 sm:p-4 md:p-6 text-center">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-primary" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{data.groups.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Gironi</p>
            </CardContent>
          </Card>
          <Card className="shadow-card hover:shadow-card-hover transition-all border-2 border-primary/20">
            <CardContent className="p-3 sm:p-4 md:p-6 text-center">
              <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto mb-1 sm:mb-2 text-primary" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{data.matches.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Partite</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Teams Section */}
          <Card className="shadow-card animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Team
                </CardTitle>
                <Link to="/gironi">
                  <Button variant="secondary" size="sm">
                    Vedi tutto
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {allStandings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nessuna classifica disponibile
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allStandings.map((standing, idx) => (
                   <div
                      key={`${standing.teamId}-${standing.groupName}`}
                      className="p-3 sm:p-4 hover:bg-muted/30 transition-colors flex items-center gap-2 sm:gap-4"
                    >
                      <div className="flex items-center gap-1 sm:gap-2 w-8 sm:w-12 shrink-0">
                        {idx < 3 && (
                          <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            idx === 0 ? 'text-yellow-500' : 
                            idx === 1 ? 'text-gray-400' : 
                            'text-orange-600'
                          }`} />
                        )}
                        <span className="font-bold text-base sm:text-lg">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base truncate">{standing.teamName}</p>
                        <p className="text-xs text-muted-foreground truncate">{standing.groupName}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-muted-foreground">V/P</p>
                          <p className="font-semibold text-sm">{standing.wins}/{standing.losses}</p>
                        </div>
                        <Badge
                          variant={standing.setDifference >= 0 ? "default" : "secondary"}
                          className="font-semibold text-xs hidden sm:inline-flex"
                        >
                          {standing.setDifference >= 0 ? "+" : ""}
                          {standing.setDifference}
                        </Badge>
                        <div className="flex items-center gap-1 bg-primary/10 px-2 sm:px-3 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          <span className="font-bold text-base sm:text-lg text-primary">
                            {standing.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Latest Matches Section */}
          <Card className="shadow-card animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardHeader className="bg-gradient-secondary text-secondary-foreground rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Ultime Partite
                </CardTitle>
                <Link to="/calendario">
                  <Button variant="secondary" size="sm">
                    Calendario
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {latestMatches.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nessuna partita completata
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {latestMatches.map((match) => {
                    const group = data.groups.find(g => g.id === match.groupId);
                    const team1 = data.teams.find(t => t.id === match.team1Id);
                    const team2 = data.teams.find(t => t.id === match.team2Id);
                    if (!team1 || !team2) return null;

                    const team1Sets = match.sets.filter(s => s.team1Score > s.team2Score).length;
                    const team2Sets = match.sets.filter(s => s.team2Score > s.team1Score).length;

                    return (
                      <div key={match.id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <Badge variant="outline" className="text-xs truncate max-w-[120px]">
                            {group?.name}
                          </Badge>
                          {match.date && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {format(new Date(match.date), "dd MMM", { locale: it })}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                          <div className="flex-1 text-right min-w-0">
                            <p className={`font-semibold text-xs sm:text-sm truncate ${team1Sets > team2Sets ? 'text-primary' : 'text-muted-foreground'}`}>
                              {team1.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-muted rounded-lg min-w-[60px] sm:min-w-[80px] justify-center shrink-0">
                            <span className={`text-lg sm:text-xl font-bold ${team1Sets > team2Sets ? 'text-primary' : ''}`}>
                              {team1Sets}
                            </span>
                            <span className="text-muted-foreground text-sm">-</span>
                            <span className={`text-lg sm:text-xl font-bold ${team2Sets > team1Sets ? 'text-primary' : ''}`}>
                              {team2Sets}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-xs sm:text-sm truncate ${team2Sets > team1Sets ? 'text-primary' : 'text-muted-foreground'}`}>
                              {team2.name}
                            </p>
                          </div>
                        </div>
                        {match.sets.length > 0 && (
                          <div className="flex gap-1 justify-center mt-2 flex-wrap">
                            {match.sets.map((set, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {set.team1Score}-{set.team2Score}
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

        {/* Quick Links */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <Link to="/teams">
            <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer border-2 hover:border-primary/50 group">
              <CardContent className="p-4 sm:p-6 text-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-bold text-base sm:text-lg">Tutti i Teams</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Visualizza giocatori e squadre</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/gironi">
            <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer border-2 hover:border-primary/50 group">
              <CardContent className="p-4 sm:p-6 text-center">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-bold text-base sm:text-lg">Gironi</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Classifiche complete per girone</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/calendario">
            <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer border-2 hover:border-primary/50 group">
              <CardContent className="p-4 sm:p-6 text-center">
                <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-bold text-base sm:text-lg">Calendario</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Tutte le partite in programma</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
