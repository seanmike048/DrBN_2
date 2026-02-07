import React, { ReactNode } from 'react';
import LanguageToggle from './LanguageToggle';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  showLanguageToggle?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showLanguageToggle = true }) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top App Bar */}
      <header className="flex justify-between items-center px-5 h-[68px] flex-shrink-0">
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              title={t('signOut')}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('signOut')}</span>
            </button>
          )}
        </div>
        {showLanguageToggle && <LanguageToggle />}
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;
