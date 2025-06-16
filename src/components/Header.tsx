
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  const handleLogoClick = () => {
    navigate('/welcome');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const displayName = profile?.first_name || user?.user_metadata?.first_name || 'Profile';

  return (
    <header className="flex items-center justify-between p-4 bg-onolo-dark border-b border-onolo-dark-lighter">
      <button onClick={handleLogoClick} className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
          <img 
            src="/lovable-uploads/3f0a1fd0-ad2b-48dc-80b5-f7e6236b39fa.png" 
            alt="Onolo Group Logo" 
            className="w-8 h-8 object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-onolo-orange">Onolo Group</h1>
      </button>
      
      <div className="flex items-center space-x-2">
        {user ? (
          <>
            <button onClick={handleUserClick} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-onolo-orange rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm text-white hidden sm:block">
                {displayName}
              </span>
            </button>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-onolo-gray hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Sign Out</span>
            </Button>
          </>
        ) : (
          <button onClick={handleUserClick} className="flex items-center space-x-2">
            <User className="w-6 h-6 text-onolo-gray" />
            <span className="text-sm text-onolo-gray hidden sm:block">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
