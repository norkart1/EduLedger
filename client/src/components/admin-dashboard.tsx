import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Users, TrendingUp, FileText, Download, 
  Edit, Plus, Minus, Search, LogOut, Loader2 
} from "lucide-react";
import { api, type Student, type Analytics } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EditAccountModal } from "@/components/edit-account-modal";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const { logout } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: () => api.getAnalytics(),
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/students'],
    queryFn: () => api.getAllStudents(),
  });

  const filteredStudents = students?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    onLogout();
  };

  const handleReportDownload = (type: 'monthly' | 'yearly', format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') {
        if (type === 'monthly') {
          api.downloadMonthlyPDF();
        } else {
          api.downloadYearlyPDF();
        }
      } else {
        if (type === 'monthly') {
          api.downloadMonthlyExcel();
        } else {
          api.downloadYearlyExcel();
        }
      }
      toast({
        title: "Download Started",
        description: `${type} ${format.toUpperCase()} report download has started`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the report",
        variant: "destructive",
      });
    }
  };

  if (analyticsLoading || studentsLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage student accounts and banking operations</p>
        </div>
        <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
      
      {/* Bank Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="banking-gradient text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Total Bank Balance</p>
                <p className="text-3xl font-bold">${analytics?.totalBalance || '0.00'}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Accounts</p>
                <p className="text-2xl font-bold">{analytics?.totalAccounts || 0}</p>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Transactions</p>
                <p className="text-2xl font-bold">{analytics?.monthlyTransactions || 0}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => handleReportDownload('monthly', 'pdf')}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <FileText className="w-4 h-4 mr-2" />
          Monthly PDF
        </Button>
        <Button 
          onClick={() => handleReportDownload('yearly', 'pdf')}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <FileText className="w-4 h-4 mr-2" />
          Yearly PDF
        </Button>
        <Button 
          onClick={() => handleReportDownload('monthly', 'excel')}
          className="bg-primary hover:bg-primary/90"
        >
          <Download className="w-4 h-4 mr-2" />
          Monthly Excel
        </Button>
        <Button 
          onClick={() => handleReportDownload('yearly', 'excel')}
          className="bg-primary hover:bg-primary/90"
        >
          <Download className="w-4 h-4 mr-2" />
          Yearly Excel
        </Button>
      </div>

      {/* Account Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Management
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Student</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Account #</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground text-right">Balance</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground text-right">Deposits</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground text-right">Withdrawals</th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents?.map((student) => (
                    <StudentTableRow 
                      key={student.id} 
                      student={student} 
                      onEdit={() => setEditingStudent(student)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredStudents?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No students found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingStudent && (
        <EditAccountModal
          student={editingStudent}
          open={!!editingStudent}
          onOpenChange={(open: boolean) => !open && setEditingStudent(null)}
        />
      )}
    </div>
  );
}

function StudentTableRow({ student, onEdit }: { student: Student; onEdit: () => void }) {
  const { toast } = useToast();

  const handleQuickTransaction = async (type: 'deposit' | 'withdrawal') => {
    const amount = prompt(`Enter ${type} amount:`);
    if (!amount || isNaN(Number(amount))) return;

    try {
      await api.createTransaction({
        studentId: student.id,
        type,
        amount,
        description: `Quick ${type} by admin`,
      });
      
      toast({
        title: "Transaction Successful",
        description: `${type} of $${amount} has been processed`,
      });
      
      // Refetch data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <tr className="hover:bg-accent/50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={student.profileImage || undefined} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {student.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{student.name}</p>
            {student.email && (
              <p className="text-sm text-muted-foreground">{student.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {student.accountNumber}
        </code>
      </td>
      <td className="px-4 py-4 text-right font-medium">
        ${student.balance}
      </td>
      <td className="px-4 py-4 text-right text-success font-medium">
        ${student.totalDeposits || '0.00'}
      </td>
      <td className="px-4 py-4 text-right text-destructive font-medium">
        ${student.totalWithdrawals || '0.00'}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 text-primary hover:text-primary/80"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickTransaction('deposit')}
            className="h-8 w-8 p-0 text-success hover:text-success/80"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuickTransaction('withdrawal')}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
