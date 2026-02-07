import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, TrendingUp, Droplet, Pipette, Apple, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const MainNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard/today', icon: CalendarDays, labelKey: 'todayPlan' },
    { to: '/dashboard/evolution', icon: TrendingUp, labelKey: 'evolution' },
    { to: '/dashboard/products', icon: Droplet, labelKey: 'myProducts' },
    { to: '/dashboard/tools', icon: Pipette, labelKey: 'tools' },
    { to: '/dashboard/nutrition', icon: Apple, labelKey: 'nutrition' },
    { to: '/dashboard/chat', icon: MessageSquare, labelKey: 'chat' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-sand/50 shadow-[0_-4px_10px_rgba(184,147,94,0.2)] z-40">
      <div className="max-w-screen-lg mx-auto px-2 py-2">
        <div className="flex items-center justify-around gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                  isActive
                    ? 'text-gold bg-gold/10'
                    : 'text-charcoal/60 hover:text-gold hover:bg-gold/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="text-[10px] font-body font-medium leading-tight text-center">
                    {t(item.labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
