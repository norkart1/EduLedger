import { useState } from "react";
import { StudentRegistration } from "@/components/student-registration";
import { StudentDashboard } from "@/components/student-dashboard";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, GraduationCap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [registeredStudentId, setRegisteredStudentId] = useState<string | null>(null);
  const { currentStudent } = useAuth();

  const activeStudentId = registeredStudentId || currentStudent;

  const handleRegistrationComplete = (studentId: string) => {
    setRegisteredStudentId(studentId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!activeStudentId ? (
          <div className="space-y-8">
            {/* Portal Selection */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">Student Banking System</h1>
              <p className="text-lg text-muted-foreground mb-8">Choose your portal to get started</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Student Portal</h3>
                    <p className="text-muted-foreground mb-4">Register for a new account or view your balance and transactions</p>
                  </CardContent>
                </Card>
                
                <Link href="/admin">
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-destructive" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Admin Portal</h3>
                      <p className="text-muted-foreground mb-4">Manage student accounts, process transactions, and generate reports</p>
                      <Button className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Login
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
            
            <StudentRegistration onRegistrationComplete={handleRegistrationComplete} />
          </div>
        ) : (
          <StudentDashboard studentId={activeStudentId} />
        )}
      </div>
    </div>
  );
}
