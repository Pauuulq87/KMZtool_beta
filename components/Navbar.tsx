import React from 'react';
import { Menu, Map, User, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Map className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">WaypointMap</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Pro</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {['教學', '支援機型', 'API', '3D 模型'].map((item) => (
              <a key={item} href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                {item}
              </a>
            ))}
            <a href="#" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1">
              進階版
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex text-sm text-slate-500 hover:text-slate-800 items-center gap-1">
               <Globe className="w-4 h-4" /> 繁體中文
            </button>
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">登入</button>
            <button className="md:hidden p-2 text-slate-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};