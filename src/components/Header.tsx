
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-onolo-dark border-b border-onolo-dark-lighter">
      <div className="flex items-center space-x-3">
        <img 
          src="/lovable-uploads/3f0a1fd0-ad2b-48dc-80b5-f7e6236b39fa.png" 
          alt="Onolo Group Logo" 
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-xl font-bold text-onolo-orange">Onolo Group</h1>
      </div>
      <button onClick={handleUserClick} className="flex items-center">
        {user ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-onolo-orange rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white hidden sm:block">
              {user.user_metadata?.first_name || 'Profile'}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-onolo-gray" />
            <span className="text-sm text-onolo-gray hidden sm:block">Sign In</span>
          </div>
        )}
      </button>
    </header>
  );
};
