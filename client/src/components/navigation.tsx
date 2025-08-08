import { Link, useLocation } from "wouter";
import { Building2, Moon, Sun, GraduationCap, Shield, Menu } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Building2 className="text-primary h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
            <span className="text-lg sm:text-xl font-bold text-foreground">Student Banking</span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-2">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? "default" : "ghost"}
                  className="nav-tab"
                  size="sm"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student Portal
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"}
                  className="nav-tab"
                  size="sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="transition-colors hover:bg-accent"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/">
                <Button 
                  variant={isActive('/') ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student Portal
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant={isActive('/admin') ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
