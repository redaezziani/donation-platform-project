import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  CircleDollarSign,
  Settings,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

const AdminSidebar = ({ isMobileMenuOpen, closeMobileMenu }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Define navigation items
  const navItems = [
    {
      title: 'لوحة التحكم',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      title: 'إدارة المستخدمين',
      href: '/admin/users',
      icon: Users
    },
    {
      title: 'إدارة الحملات',
      href: '/admin/campaigns',
      icon: HeartHandshake
    },
    {
      title: 'التبرعات',
      href: '/admin/donations',
      icon: CircleDollarSign
    }
  ];
  
  // Helper items (settings, help)
  const helperItems = [
    {
      title: 'الإعدادات',
      href: '/admin/settings',
      icon: Settings
    },
    {
      title: 'المساعدة',
      href: '/admin/help',
      icon: HelpCircle
    }
  ];
  
  // Active link checker
  const isLinkActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };
  
  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-50 bg-white border-l shadow-md w-64 transition-transform duration-300 ease-in-out transform md:translate-x-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo & Brand */}
      <div className="p-5 border-b">
        <Link to="/" className="flex items-center justify-start">
          <span className="text-2xl font-AlRaiMediaBold text-primary">قلب واحد</span>
        </Link>
      </div>
      
      {/* Admin Info */}
      <div className="p-5 border-b">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary">{user?.username?.slice(0, 1).toUpperCase() || 'A'}</span>
          </div>
          <div>
            <p className="font-medium">{user?.full_name || user?.username || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">لوحة الإدارة</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
        <div className="text-xs text-muted-foreground mb-3">القائمة الرئيسية</div>
        
        {navItems.map((item, index) => (
          <Link
            to={item.href}
            key={index}
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted",
              isLinkActive(item.href) 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
        
        <div className="border-t my-6"></div>
        <div className="text-xs text-muted-foreground mb-3">الدعم</div>
        
        {helperItems.map((item, index) => (
          <Link
            to={item.href}
            key={index}
            onClick={closeMobileMenu}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted",
              isLinkActive(item.href) 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="p-5 border-t">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 justify-center"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;