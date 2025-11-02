import { useState } from "react";
import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { format, isSameDay, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { it } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

const Calendar = () => {
  const { data } = useTournament();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const matchesForSelectedDate = data.matches.filter(match => 
    match.date && isSameDay(new Date(match.date), selectedDate)
  );

  // Filter matches based on search query
  const filterMatches = (matches: typeof data.matches) => {
    if (!searchQuery.trim()) return matches;
    
    const query = searchQuery.toLowerCase();
    const filtered = matches.filter(match => {
      const team1 = data.teams.find(t => t.id === match.team1Id);
      const team2 = data.teams.find(t => t.id === match.team2Id);
      const group = data.groups.find(g => g.id === match.groupId);
      
      const team1Name = team1?.name.toLowerCase() || "";
      const team2Name = team2?.name.toLowerCase() || "";
      const groupName = group?.name.toLowerCase() || "";
      const matchDate = match.date ? new Date(match.date).toLocaleDateString("it-IT") : "";
      
      return team1Name.includes(query) || 
             team2Name.includes(query) || 
             groupName.includes(query) || 
             matchDate.includes(query);
    });
    
    // If no results found, return original matches to keep display unchanged
    return filtered.length > 0 ? filtered : matches;
  };

  // Group matches by giornate for all groups
  const giornateView = data.groups.map(group => {
    const groupMatches = data.matches.filter(m => m.groupId === group.id && m.giornata);
    const filteredMatches = filterMatches(groupMatches);
    
    const giornate = new Map<number, typeof filteredMatches>();
    filteredMatches.forEach(match => {
      const giornata = match.giornata!;
      if (!giornate.has(giornata)) {
        giornate.set(giornata, []);
      }
      giornate.get(giornata)!.push(match);
    });
    
    return {
      group,
      giornate: Array.from(giornate.entries()).sort((a, b) => a[0] - b[0])
    };
  }).filter(g => g.giornate.length > 0);

  // On mobile, when searching, group all results in a single card
  const isSearchActive = searchQuery.trim().length > 0;
  const allFilteredMatches = isSearchActive 
    ? data.matches.filter(m => m.giornata).filter(match => {
        const team1 = data.teams.find(t => t.id === match.team1Id);
        const team2 = data.teams.find(t => t.id === match.team2Id);
        const group = data.groups.find(g => g.id === match.groupId);
        
        const team1Name = team1?.name.toLowerCase() || "";
        const team2Name = team2?.name.toLowerCase() || "";
        const groupName = group?.name.toLowerCase() || "";
        const matchDate = match.date ? new Date(match.date).toLocaleDateString("it-IT") : "";
        const query = searchQuery.toLowerCase();
        
        return team1Name.includes(query) || 
               team2Name.includes(query) || 
               groupName.includes(query) || 
               matchDate.includes(query);
      })
    : [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Calendario Partite
        </h1>
        <p className="text-muted-foreground">
          Consulta le partite programmate e i risultati
        </p>
      </div>

      {/* Giornate Section */}
      {giornateView.length > 0 && (
        <div className="space-y-6">
          {/* Desktop layout */}
          <div className="hidden md:flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Giornate</h2>
              <p className="text-sm text-muted-foreground">
                Tutte le partite organizzate per giornata
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSearchOpen && (
                <div className="relative animate-fade-in">
                  <Input
                    type="text"
                    placeholder="Cerca team, girone o data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pr-8 transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) {
                    setSearchQuery("");
                  }
                }}
                className="hover-scale"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Giornate</h2>
              <p className="text-sm text-muted-foreground">
                Tutte le partite organizzate per giornata
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSearchOpen && (
                <div className="relative animate-fade-in flex-1">
                  <Input
                    type="text"
                    placeholder="Cerca team, girone o data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-8 transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) {
                    setSearchQuery("");
                  }
                }}
                className="hover-scale shrink-0"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Single card with all search results - All devices */}
            {isSearchActive && allFilteredMatches.length > 0 && (
              <Card className="shadow-card overflow-hidden">
                <CardHeader className="bg-gradient-primary text-primary-foreground">
                  <CardTitle>Risultati ricerca</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-3">
                    {allFilteredMatches.map((match) => {
                      const team1 = data.teams.find(t => t.id === match.team1Id);
                      const team2 = data.teams.find(t => t.id === match.team2Id);
                      const group = data.groups.find(g => g.id === match.groupId);
                      
                      return (
                        <div
                          key={match.id}
                          className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">
                                {group?.name} - Giornata {match.giornata}
                              </p>
                              <p className="font-semibold text-sm mb-1">
                                {team1?.name} vs {team2?.name}
                              </p>
                              {match.date && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(match.date).toLocaleDateString("it-IT")}
                                  {match.time && ` - ${match.time}`}
                                </p>
                              )}
                              {!match.date && (
                                <p className="text-xs text-muted-foreground italic">
                                  Data da definire
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant={match.completed ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {match.completed ? "Giocata" : "Programmata"}
                            </Badge>
                          </div>
                          
                          {match.sets.length > 0 && (
                            <div className="flex gap-1 mt-2">
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
                </CardContent>
              </Card>
            )}

            {/* Original grouped layout when not searching */}
            {!isSearchActive && [...giornateView].sort((a, b) => a.group.name.localeCompare(b.group.name)).map(({ group, giornate }) => (
                <Card key={group.id} className="shadow-card overflow-hidden">
                  <CardHeader className="bg-gradient-primary text-primary-foreground">
                    <CardTitle>{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {giornate.map(([giornataNum, matches]) => (
                        <div key={giornataNum}>
                          <div className="flex items-center gap-3 mb-4">
                            <Badge variant="default" className="text-base px-4 py-1">
                              Giornata {giornataNum}
                            </Badge>
                            <Separator className="flex-1" />
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-3">
                            {matches.map((match) => {
                              const team1 = data.teams.find(t => t.id === match.team1Id);
                              const team2 = data.teams.find(t => t.id === match.team2Id);
                              
                              return (
                                <div
                                  key={match.id}
                                  className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm mb-1">
                                        {team1?.name} vs {team2?.name}
                                      </p>
                                      {match.date && (
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(match.date).toLocaleDateString("it-IT")}
                                          {match.time && ` - ${match.time}`}
                                        </p>
                                      )}
                                      {!match.date && (
                                        <p className="text-xs text-muted-foreground italic">
                                          Data da definire
                                        </p>
                                      )}
                                    </div>
                                    <Badge 
                                      variant={match.completed ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {match.completed ? "Giocata" : "Programmata"}
                                    </Badge>
                                  </div>
                                  
                                  {match.sets.length > 0 && (
                                    <div className="flex gap-1 mt-2">
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          
          <Separator className="my-8" />
        </div>
      )}

      {/* Weekly Calendar Section */}
      <div>
        <h2 className="text-2xl font-bold mb-1">Calendario Settimanale</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Seleziona un giorno per vedere le partite con data e ora definite
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Weekly Calendar View */}
          <Card className="shadow-card h-fit">
            <CardHeader className="bg-gradient-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                  className="hover:bg-primary-foreground/20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <CardTitle className="text-lg">
                  {format(currentWeekStart, "MMMM yyyy", { locale: it })}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                  className="hover:bg-primary-foreground/20"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {weekDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const dayMatches = data.matches.filter(m => m.date && isSameDay(new Date(m.date), day));
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-medium uppercase ${
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}>
                            {format(day, "EEEE", { locale: it })}
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {format(day, "d")}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isToday && (
                            <Badge variant="secondary" className="text-xs">
                              Oggi
                            </Badge>
                          )}
                          {dayMatches.length > 0 && (
                            <Badge variant={isSelected ? "secondary" : "default"} className="text-xs">
                              {dayMatches.length} {dayMatches.length === 1 ? "partita" : "partite"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Matches List */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
              </h2>
            </div>

            {matchesForSelectedDate.length === 0 ? (
              <Card className="shadow-card animate-scale-in">
                <CardContent className="p-12 text-center">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Nessuna partita programmata per questa data.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {matchesForSelectedDate.map((match, idx) => {
                  const group = data.groups.find(g => g.id === match.groupId);
                  const team1 = data.teams.find(t => t.id === match.team1Id);
                  const team2 = data.teams.find(t => t.id === match.team2Id);

                  if (!team1 || !team2) return null;

                  const team1Sets = match.sets.filter(s => s.team1Score > s.team2Score).length;
                  const team2Sets = match.sets.filter(s => s.team2Score > s.team1Score).length;

                  return (
                    <Card
                      key={match.id}
                      className="shadow-card hover:shadow-card-hover transition-all duration-300"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {group?.name || "Gruppo sconosciuto"}
                          </CardTitle>
                          <Badge variant={match.completed ? "default" : "secondary"}>
                            {match.completed ? "Completata" : "In programma"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {match.time && (
                          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{match.time}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 text-right">
                            <p className="font-bold text-lg">{team1.name}</p>
                          </div>

                          <div className="flex items-center gap-3 px-6 py-3 bg-muted rounded-lg">
                            {match.completed ? (
                              <>
                                <span className="text-2xl font-bold text-primary">{team1Sets}</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="text-2xl font-bold text-primary">{team2Sets}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground font-semibold">VS</span>
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="font-bold text-lg">{team2.name}</p>
                          </div>
                        </div>

                        {match.completed && match.sets.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-2">Dettaglio set:</p>
                            <div className="flex gap-2">
                              {match.sets.map((set, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {set.team1Score}-{set.team2Score}
                                </Badge>
                              ))}
                            </div>
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
      </div>
    </div>
  );
};

export default Calendar;
