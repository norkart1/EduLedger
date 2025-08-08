import { useState } from "react";
import { AdminLogin } from "@/components/admin-login";
import { AdminDashboard } from "@/components/admin-dashboard";
import { useAuth } from "@/lib/auth";

export default function Admin() {
  const { isAuthenticated } = useAuth();
  const [showDashboard, setShowDashboard] = useState(isAuthenticated);

  const handleLoginSuccess = () => {
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showDashboard ? (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        ) : (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}
