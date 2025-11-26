import React from 'react';
import {
    MousePointer2,
    Pentagon,
    Square,
    Circle,
    MapPin,
    Settings,
    HelpCircle,
    Menu
} from 'lucide-react';

interface SidebarProps {
    activeTool: string;
    onToolChange: (tool: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolChange }) => {
    const tools = [
        { id: 'select', icon: MousePointer2, label: '選取' },
        { id: 'polygon', icon: Pentagon, label: '多邊形' },
        { id: 'rectangle', icon: Square, label: '矩形' },
        { id: 'circle', icon: Circle, label: '圓形' },
        { id: 'waypoint', icon: MapPin, label: '航點' },
    ];

    return (
        <div className="h-full w-16 bg-slate-900 flex flex-col items-center py-4 gap-4 text-slate-400">
            {/* Logo / Menu */}
            <div className="p-2 mb-4 text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                <Menu className="w-6 h-6" />
            </div>

            {/* Tools */}
            <div className="flex-1 flex flex-col gap-2 w-full px-2">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onToolChange(tool.id)}
                        className={`p-3 rounded-xl flex justify-center items-center transition-all duration-200 group relative
              ${activeTool === tool.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'hover:bg-slate-800 hover:text-slate-200'
                            }`}
                        title={tool.label}
                    >
                        <tool.icon className="w-5 h-5" />

                        {/* Tooltip */}
                        <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            {tool.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2 w-full px-2 mt-auto">
                <button className="p-3 rounded-xl hover:bg-slate-800 hover:text-slate-200 flex justify-center transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl hover:bg-slate-800 hover:text-slate-200 flex justify-center transition-colors">
                    <HelpCircle className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
