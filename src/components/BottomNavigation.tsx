
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, MessageSquare, Menu, FileText, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: FileText, label: 'Order', path: '/order' },
  { icon: ShoppingCart, label: 'Cart', path: '/cart' },
  { icon: ClipboardList, label: 'Orders', path: '/orders' },
  { icon: Menu, label: 'Menu', path: '/menu' },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-onolo-dark border-t border-onolo-dark-lighter">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isCart = item.path === '/cart';
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 relative",
                isActive 
                  ? "text-onolo-orange bg-onolo-orange/10 scale-105" 
                  : "text-onolo-gray hover:text-white hover:bg-onolo-dark-lighter"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-6 h-6", isActive && "drop-shadow-lg")} />
                {isCart && totalItems > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </div>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                isActive && "font-bold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-onolo-orange rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
