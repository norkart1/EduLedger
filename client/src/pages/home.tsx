import { useState } from "react";
import { StudentRegistration } from "@/components/student-registration";
import { StudentDashboard } from "@/components/student-dashboard";
import { useAuth } from "@/lib/auth";

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
          <StudentRegistration onRegistrationComplete={handleRegistrationComplete} />
        ) : (
          <StudentDashboard studentId={activeStudentId} />
        )}
      </div>
    </div>
  );
}
