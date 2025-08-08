import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const loginSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
});

type LoginData = z.infer<typeof loginSchema>;

interface StudentLoginProps {
  onLoginSuccess: (studentId: string) => void;
  onBackToRegister: () => void;
}

export function StudentLogin({ onLoginSuccess, onBackToRegister }: StudentLoginProps) {
  const { toast } = useToast();
  const { setCurrentStudent } = useAuth();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      accountNumber: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      // Get all students and find the one with matching account number
      const students = await api.getAllStudents();
      const student = students.find(s => s.accountNumber.toLowerCase() === data.accountNumber.toLowerCase());
      
      if (!student) {
        throw new Error("Account not found. Please check your account number.");
      }
      
      return student;
    },
    onSuccess: (student) => {
      setCurrentStudent(student.id);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${student.name}!`,
      });
      onLoginSuccess(student.id);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Student Login</CardTitle>
          <p className="text-muted-foreground">Access your existing account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                {...form.register("accountNumber")}
                placeholder="Enter your account number (e.g., ACC-2025-123456)"
                className="mt-1"
              />
              {form.formState.errors.accountNumber && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.accountNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Account
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBackToRegister}
              >
                Back to Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}