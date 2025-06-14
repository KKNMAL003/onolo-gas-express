
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: User, label: 'Order', path: '/order' },
  { icon: User, label: 'Cart', path: '/cart' },
  { icon: User, label: 'Chat', path: '/chat' },
  { icon: Menu, label: 'Menu', path: '/menu' },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-onolo-dark border-t border-onolo-dark-lighter">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors",
                isActive 
                  ? "text-onolo-orange" 
                  : "text-onolo-gray hover:text-white"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
