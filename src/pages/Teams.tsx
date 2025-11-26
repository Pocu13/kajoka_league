import { useState } from "react";
import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Calendar = () => {
  const { data } = useTournament();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 space-y-6 sm:space-y-8 animate-fade-in max-w-7xl">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent px-2">
          Calendario Partite
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base px-2">
          Consulta le partite programmate e i risultati
        </p>
      </div>

      {/* Giornate Section */}
      {giornateView.length > 0 && (
        <div className="space-y-6">
          {/* Desktop layout */}
          <div className="hidden md:flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Giornate</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
          <div className="md:hidden space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Giornate</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
                          className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1 truncate">
                                {group?.name} - Giornata {match.giornata}
                              </p>
                              <p className="font-semibold text-xs sm:text-sm mb-1">
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
                              className="text-xs shrink-0"
                            >
                              {match.completed ? "Giocata" : "Prog."}
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {matches.map((match) => {
                              const team1 = data.teams.find(t => t.id === match.team1Id);
                              const team2 = data.teams.find(t => t.id === match.team2Id);
                              
                              return (
                                <div
                                  key={match.id}
                                  className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-2 gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-xs sm:text-sm mb-1">
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
                                      className="text-xs shrink-0"
                                    >
                                      {match.completed ? "Giocata" : "Prog."}
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
        </div>
      )}
    </div>
  );
};

export default Calendar;
