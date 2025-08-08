import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  profileImage: z.any().optional(),
});

type RegistrationData = z.infer<typeof registrationSchema>;

interface StudentRegistrationProps {
  onRegistrationComplete: (studentId: string) => void;
}

export function StudentRegistration({ onRegistrationComplete }: StudentRegistrationProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { setCurrentStudent } = useAuth();

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (formData: FormData) => api.createStudent(formData),
    onSuccess: (student) => {
      toast({
        title: "Account Created Successfully!",
        description: `Your account number is ${student.accountNumber}`,
      });
      setCurrentStudent(student.id);
      onRegistrationComplete(student.id);
      form.reset();
      setPreviewImage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("profileImage", file);
    }
  };

  const onSubmit = (data: RegistrationData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.email) {
      formData.append("email", data.email);
    }
    if (data.profileImage) {
      formData.append("profileImage", data.profileImage);
    }
    
    createStudentMutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Student Registration</CardTitle>
          <p className="text-muted-foreground">Create your banking account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter your full name"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="your.email@example.com"
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="profileImage">Profile Image</Label>
              <div className="mt-1 flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                {previewImage && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createStudentMutation.isPending}
            >
              {createStudentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
