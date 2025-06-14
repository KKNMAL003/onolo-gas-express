
import React from 'react';
import { User } from 'lucide-react';

export const Header = () => {
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
      <div className="flex items-center">
        <User className="w-6 h-6 text-onolo-gray" />
      </div>
    </header>
  );
};
