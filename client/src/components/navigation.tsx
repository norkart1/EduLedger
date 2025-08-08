import { Link, useLocation } from "wouter";
import { Building2, Moon, Sun, GraduationCap, Shield } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Building2 className="text-primary h-8 w-8 mr-3" />
            <span className="text-xl font-bold text-foreground">Student Banking</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-2">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? "default" : "ghost"}
                  className="nav-tab"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student Portal
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"}
                  className="nav-tab"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-colors hover:bg-accent"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
