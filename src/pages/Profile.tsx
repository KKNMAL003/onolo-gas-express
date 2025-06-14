
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-onolo-dark text-white flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-onolo-dark text-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="w-6 h-6 text-onolo-gray" />
            </button>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="w-24 h-24 bg-onolo-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-semibold">
              {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-onolo-gray">{user.email}</p>
          </div>

          {/* Profile Information */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      size="sm"
                      className="text-onolo-gray"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      size="sm"
                      className="bg-onolo-orange hover:bg-onolo-orange-dark text-white"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setEditing(true)}
                    size="sm"
                    className="bg-onolo-orange hover:bg-onolo-orange-dark text-white"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    disabled={!editing}
                    className="bg-onolo-dark border-onolo-gray text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    disabled={!editing}
                    className="bg-onolo-dark border-onolo-gray text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-onolo-dark border-onolo-gray text-white opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!editing}
                  className="bg-onolo-dark border-onolo-gray text-white disabled:opacity-50"
                  placeholder="+27 11 xxx xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Delivery Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!editing}
                  className="bg-onolo-dark border-onolo-gray text-white disabled:opacity-50"
                  placeholder="Enter your delivery address"
                />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Email Verified</span>
                <div className={`px-2 py-1 rounded text-xs ${
                  user.email_confirmed_at 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.email_confirmed_at ? 'Verified' : 'Not Verified'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Member Since</span>
                <span className="text-onolo-gray text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
