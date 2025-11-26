import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, Calendar, Users, UsersRound, Shield, Home, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/classifiche", label: "Classifiche", icon: Trophy },
  { path: "/calendario", label: "Calendario", icon: Calendar },
  { path: "/gironi", label: "Gironi", icon: UsersRound },
  { path: "/teams", label: "Teams", icon: Users },
];

export const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-card shadow-card sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover-scale min-w-0">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap truncate">
              Kajoka League 3.0
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={isActive ? "shadow-primary" : ""}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{label}</span>
                  </Button>
                </Link>
              );
            })}
            
            <Link to="/admin">
              <Button variant="outline" size="sm" className="ml-2">
                <Shield className="w-4 h-4 mr-2" />
                <span>Admin</span>
              </Button>
            </Link>
          </div>

          {/* Mobile & Tablet Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 md:w-72">
              <div className="flex flex-col gap-4 mt-8">
                <h2 className="text-lg font-bold mb-4">Menu</h2>
                
                {navItems.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path;
                  return (
                    <SheetClose asChild key={path}>
                      <Link to={path}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start text-base md:text-lg"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                          {label}
                        </Button>
                      </Link>
                    </SheetClose>
                  );
                })}
                
                <SheetClose asChild>
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-base md:text-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      <Shield className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                      Admin Panel
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
