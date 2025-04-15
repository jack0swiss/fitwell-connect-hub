
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export function ClientManagementDialog() {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First check if the user already exists
      const { data: existingUsers, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .limit(1);
      
      if (searchError) {
        console.error('Error checking existing user:', searchError);
        toast({
          title: "Error",
          description: "Failed to check if user exists. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Error",
          description: "A user with this email already exists.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create auth user with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'client',
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) {
        // Handle specific error for already registered user
        if (authError.message?.includes('already registered')) {
          toast({
            title: "Error",
            description: "This email is already registered in the system.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone
          });

        if (profileError) throw profileError;

        toast({
          title: "Success",
          description: "Client created successfully",
        });
        
        resetForm();
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2" onClick={() => setIsOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add New Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Client'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
