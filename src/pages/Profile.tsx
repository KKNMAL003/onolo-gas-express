
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DeliveryPreferences from '@/components/DeliveryPreferences';
import { User, Save, X, Mail, LogOut } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  });

  const handleClose = () => {
    navigate('/');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-onolo-gray mb-4">You need to be signed in to view your profile.</p>
          <Button onClick={() => navigate('/auth')} className="bg-onolo-orange hover:bg-onolo-orange-dark">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-onolo-dark text-white p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-onolo-gray hover:text-white p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Account Information */}
        <div className="bg-onolo-dark-lighter rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Account Information
          </h2>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-onolo-gray">Email Address</Label>
              <div className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2 opacity-60">
                {user.email}
              </div>
              <p className="text-xs text-onolo-gray mt-1">Email address cannot be changed from this page</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-onolo-dark-lighter rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 bg-onolo-dark border border-onolo-gray rounded-xl text-white mt-2"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-onolo-orange hover:bg-onolo-orange-dark flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        {/* Delivery Preferences */}
        <DeliveryPreferences />

        {/* Sign Out Section */}
        <div className="bg-onolo-dark-lighter rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
