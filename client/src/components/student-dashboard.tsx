import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash, Wallet, TrendingUp, TrendingDown, User, Clock, LogOut } from "lucide-react";
import { api, type Student, type Transaction } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { CopyableAccountNumber } from "@/components/copyable-account-number";

interface StudentDashboardProps {
  studentId: string;
}

export function StudentDashboard({ studentId }: StudentDashboardProps) {
  const { setCurrentStudent } = useAuth();
  const { toast } = useToast();
  
  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['/api/students', studentId],
    queryFn: () => api.getStudent(studentId),
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/students', studentId, 'transactions'],
    queryFn: () => api.getStudentTransactions(studentId),
  });

  if (studentLoading) {
    return <StudentDashboardSkeleton />;
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    );
  }

  const totalDeposits = transactions
    ?.filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const totalWithdrawals = transactions
    ?.filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const handleLogout = () => {
    setCurrentStudent('');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Logout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Welcome back, {student?.name}!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Here's your account overview</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 w-fit">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Account Number</p>
                <CopyableAccountNumber accountNumber={student.accountNumber} />
              </div>
              <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current Balance</p>
                <p className="text-lg sm:text-2xl font-bold text-success">${student.balance}</p>
              </div>
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-success flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Deposits</p>
                <p className="text-base sm:text-xl font-bold text-primary">${totalDeposits.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Withdrawals</p>
                <p className="text-base sm:text-xl font-bold text-destructive">${totalWithdrawals.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-destructive flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-4 border-primary/20">
              <AvatarImage src={student.profileImage || undefined} alt={student.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{student.name}</h3>
              {student.email && (
                <p className="text-muted-foreground">{student.email}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Member since: {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : transactions?.length ? (
            <div className="space-y-1">
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <Badge
          variant={transaction.type === 'deposit' ? 'default' : 'destructive'}
          className={transaction.type === 'deposit' ? 'transaction-deposit' : 'transaction-withdrawal'}
        >
          {transaction.type === 'deposit' ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
        </Badge>
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date(transaction.createdAt).toLocaleDateString()}
          </p>
          {transaction.description && (
            <p className="text-xs text-muted-foreground">{transaction.description}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${transaction.type === 'deposit' ? 'text-success' : 'text-destructive'}`}>
          {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
        </p>
        <p className="text-xs text-muted-foreground">
          Balance: ${transaction.balanceAfter}
        </p>
      </div>
    </div>
  );
}

function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
