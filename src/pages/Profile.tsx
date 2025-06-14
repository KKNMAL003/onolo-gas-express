
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = () => {
    // Save profile logic would go here
    setEditing(false);
  };

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
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-onolo-gray">{profile.email}</p>
          </div>

          {/* Profile Information */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <Button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="bg-onolo-orange hover:bg-onolo-orange-dark text-white"
              >
                {editing ? 'Save' : 'Edit'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    disabled={!editing}
                    className="bg-onolo-dark border-onolo-gray text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    disabled={!editing}
                    className="bg-onolo-dark border-onolo-gray text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <Input
                  value={profile.email}
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
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  disabled={!editing}
                  className="bg-onolo-dark border-onolo-gray text-white"
                  placeholder="+27 11 xxx xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  disabled={!editing}
                  className="bg-onolo-dark border-onolo-gray text-white"
                  placeholder="Enter your delivery address"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-onolo-dark-lighter rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Email Notifications</span>
                <button className="w-12 h-6 bg-onolo-orange rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>SMS Notifications</span>
                <button className="w-12 h-6 bg-onolo-gray rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
