import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, type Student } from "@/lib/api";

const editBalanceSchema = z.object({
  balance: z.string().min(1, "Balance is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "Balance must be a positive number"
  ),
});

const transactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  description: z.string().optional(),
});

type EditBalanceData = z.infer<typeof editBalanceSchema>;
type TransactionData = z.infer<typeof transactionSchema>;

interface EditAccountModalProps {
  student: Student;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountModal({ student, open, onOpenChange }: EditAccountModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const balanceForm = useForm<EditBalanceData>({
    resolver: zodResolver(editBalanceSchema),
    defaultValues: {
      balance: student.balance,
    },
  });

  const transactionForm = useForm<TransactionData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'deposit',
      amount: '',
      description: '',
    },
  });

  const updateBalanceMutation = useMutation({
    mutationFn: (data: EditBalanceData) => api.updateStudent(student.id, { balance: data.balance }),
    onSuccess: () => {
      toast({
        title: "Balance Updated",
        description: "Student balance has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionData) => 
      api.createTransaction({
        studentId: student.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
      }),
    onSuccess: (_, variables) => {
      toast({
        title: "Transaction Successful",
        description: `${variables.type} of $${variables.amount} has been processed`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      transactionForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onBalanceSubmit = (data: EditBalanceData) => {
    updateBalanceMutation.mutate(data);
  };

  const onTransactionSubmit = (data: TransactionData) => {
    createTransactionMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account: {student.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Edit Balance
            </TabsTrigger>
            <TabsTrigger value="transaction" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Add Transaction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Current Balance: <span className="font-semibold">${student.balance}</span>
            </div>
            <form onSubmit={balanceForm.handleSubmit(onBalanceSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="balance">New Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  {...balanceForm.register("balance")}
                  placeholder="0.00"
                  className="mt-1"
                />
                {balanceForm.formState.errors.balance && (
                  <p className="text-sm text-destructive mt-1">
                    {balanceForm.formState.errors.balance.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateBalanceMutation.isPending}
                >
                  {updateBalanceMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Balance'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="transaction" className="space-y-4 mt-4">
            <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-4">
              <div>
                <Label>Transaction Type</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="deposit"
                      {...transactionForm.register("type")}
                      className="text-success"
                    />
                    <span className="flex items-center gap-1 text-success">
                      <TrendingUp className="h-4 w-4" />
                      Deposit
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="withdrawal"
                      {...transactionForm.register("type")}
                      className="text-destructive"
                    />
                    <span className="flex items-center gap-1 text-destructive">
                      <TrendingDown className="h-4 w-4" />
                      Withdrawal
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...transactionForm.register("amount")}
                  placeholder="0.00"
                  className="mt-1"
                />
                {transactionForm.formState.errors.amount && (
                  <p className="text-sm text-destructive mt-1">
                    {transactionForm.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...transactionForm.register("description")}
                  placeholder="Transaction description..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => transactionForm.reset()}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={createTransactionMutation.isPending}
                >
                  {createTransactionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add Transaction'
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
