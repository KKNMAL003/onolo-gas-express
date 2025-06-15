
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';

interface PasswordResetProps {
  onBack: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) throw error;

      setIsEmailSent(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error sending reset email",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-onolo-orange/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-onolo-orange" />
        </div>
        <h3 className="text-xl font-semibold text-white">Check your email</h3>
        <p className="text-onolo-gray">
          We've sent password reset instructions to <strong>{email}</strong>
        </p>
        <Button onClick={onBack} variant="outline" className="w-full mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Reset your password</h2>
        <p className="text-onolo-gray">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <Label htmlFor="reset-email">Email address</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-onolo-orange hover:bg-onolo-orange-dark text-white font-semibold py-3 rounded-xl"
        >
          {isLoading ? 'Sending...' : 'Send reset email'}
        </Button>
      </form>

      <div className="text-center">
        <Button onClick={onBack} variant="ghost" className="text-onolo-orange">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Button>
      </div>
    </div>
  );
};

export default PasswordReset;
