import { useState } from "react";
import { useTournament } from "@/contexts/TournamentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogOut } from "lucide-react";
import { AdminTeams } from "@/components/admin/AdminTeams";
import { AdminGroups } from "@/components/admin/AdminGroups";
import { AdminMatches } from "@/components/admin/AdminMatches";
import { AdminBrackets } from "@/components/admin/AdminBrackets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const { isAdmin, login, logout } = useTournament();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card animate-scale-in">
          <CardHeader className="bg-gradient-accent text-accent-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full shadow-primary">
                Accedi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-hero bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gestisci teams, gironi e partite
            </p>
          </div>
          <Button onClick={logout} variant="outline" className="w-full sm:w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="teams" className="text-xs sm:text-sm px-2 py-2">Teams</TabsTrigger>
            <TabsTrigger value="groups" className="text-xs sm:text-sm px-2 py-2">Gironi</TabsTrigger>
            <TabsTrigger value="matches" className="text-xs sm:text-sm px-2 py-2">Partite</TabsTrigger>
            <TabsTrigger value="brackets" className="text-xs sm:text-sm px-2 py-2">Tabelloni</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="animate-fade-in">
            <AdminTeams />
          </TabsContent>

          <TabsContent value="groups" className="animate-fade-in">
            <AdminGroups />
          </TabsContent>

          <TabsContent value="matches" className="animate-fade-in">
            <AdminMatches />
          </TabsContent>

          <TabsContent value="brackets" className="animate-fade-in">
            <AdminBrackets />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
