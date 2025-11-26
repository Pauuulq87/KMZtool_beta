import React, { useState } from 'react';
import { Search, Crosshair, Layers, Maximize, Minus, Plus, MapPin } from 'lucide-react';

export const MapEditor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full h-[500px] bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-300 group">

      {/* Map Placeholder / Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.02]"
        style={{
          backgroundImage: 'url("https://picsum.photos/1200/800?grayscale&blur=2")',
          filter: 'contrast(1.1)'
        }}
      >
        {/* Simulated Map Grid/Overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
      </div>

      {/* Central "Select Area" Hint */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-3">
          <MapPin className="text-blue-600 w-5 h-5 animate-bounce" />
          <span className="font-semibold text-slate-700">拖曳以選取區域</span>
        </div>
      </div>

      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-96 z-10">
        <div className="relative group/search">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within/search:text-blue-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-white shadow-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
            placeholder="搜尋地點 (例如：大安森林公園)"
          />
          <button className="absolute inset-y-1 right-1 bg-blue-600 text-white px-3 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
            前往
          </button>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          <button className="p-2.5 hover:bg-slate-50 border-b border-slate-100 block" title="放大">
            <Plus className="w-5 h-5 text-slate-700" />
          </button>
          <button className="p-2.5 hover:bg-slate-50 block" title="縮小">
            <Minus className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        <button className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700">
          <Crosshair className="w-5 h-5" />
        </button>
        <button className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700">
          <Layers className="w-5 h-5" />
        </button>
        <button className="p-2.5 bg-white rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700">
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Map Attribution Stub */}
      <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-white/70 text-[10px] text-slate-500 rounded">
        © Google Maps Data
      </div>

      {/* Interactive Layer (Invisible but captures events) */}
      <div
        className="absolute inset-0 cursor-crosshair z-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      ></div>
    </div>
  );
};