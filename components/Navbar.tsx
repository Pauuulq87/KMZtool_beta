import React from 'react';
import { Plane, User as UserIcon, LogOut, Map, Globe, Menu } from 'lucide-react';
import { User } from '../services/authService';

import { Language } from '../utils/i18n';

interface NavbarProps {
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: any;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick, onLogoutClick, language, onLanguageChange, t }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="w-full pr-4 sm:pr-6 lg:pr-8 pl-0">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-16 flex justify-center flex-shrink-0">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Map className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">{t['brand_name']}</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{t['beta']}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'zh-TW' : 'en')}
              className="flex text-sm text-slate-500 hover:text-slate-800 items-center gap-1 font-medium"
            >
              <Globe className="w-4 h-4" /> {language === 'en' ? '繁體中文' : 'English'}
            </button>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            {/* Auth buttons removed for V1 */}
          </div>
        </div>
      </div>
    </nav>
  );
};
