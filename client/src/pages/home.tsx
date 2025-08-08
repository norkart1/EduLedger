import { useState } from "react";
import { StudentRegistration } from "@/components/student-registration";
import { StudentLogin } from "@/components/student-login";
import { StudentDashboard } from "@/components/student-dashboard";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, GraduationCap, LogIn, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [registeredStudentId, setRegisteredStudentId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const { currentStudent } = useAuth();

  const activeStudentId = registeredStudentId || currentStudent;

  const handleRegistrationComplete = (studentId: string) => {
    setRegisteredStudentId(studentId);
  };

  const handleLoginSuccess = (studentId: string) => {
    setRegisteredStudentId(studentId);
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!activeStudentId ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Portal Selection */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">Student Banking System</h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">Choose your portal to get started</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8">
                <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="mx-auto mb-3 sm:mb-4 w-12 sm:w-16 h-12 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Student Portal</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4">Register for a new account or access your existing account</p>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        variant={showLogin ? "outline" : "default"}
                        onClick={() => setShowLogin(false)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create New Account
                      </Button>
                      <Button 
                        className="w-full" 
                        variant={showLogin ? "default" : "outline"}
                        onClick={() => setShowLogin(true)}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login to Existing Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Link href="/admin">
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className="mx-auto mb-3 sm:mb-4 w-12 sm:w-16 h-12 sm:h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                        <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-destructive" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">Admin Portal</h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4">Manage student accounts, process transactions, and generate reports</p>
                      <Button className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Login
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
            
            {/* Student Forms */}
            {showLogin ? (
              <StudentLogin 
                onLoginSuccess={handleLoginSuccess} 
                onBackToRegister={() => setShowLogin(false)}
              />
            ) : (
              <StudentRegistration onRegistrationComplete={handleRegistrationComplete} />
            )}
          </div>
        ) : (
          <StudentDashboard studentId={activeStudentId} />
        )}
      </div>
    </div>
  );
}
