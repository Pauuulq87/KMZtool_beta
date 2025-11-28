import React, { useRef } from 'react';
import { Pentagon, Square, MapPin, MousePointer2, MousePointer, Upload, Circle } from 'lucide-react';

interface SidebarProps {
    activeTool: string;
    onToolChange: (tool: string) => void;
    t: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolChange, t }) => {
    const tools = [
        { id: 'polygon', icon: Pentagon, label: t['polygon'] },
        { id: 'rectangle', icon: Square, label: t['rectangle'] },
    ];

    return (
        <div className="h-full w-16 bg-white border-r border-primary/10 flex flex-col items-center py-4 gap-4 z-20 relative shadow-xl">

            {/* Tools */}
            <div className="flex flex-col gap-2 w-full px-2">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;

                    return (
                        <button
                            key={tool.id}
                            onClick={() => onToolChange(isActive ? 'select' : tool.id)}
                            className={`w-full aspect-square flex flex-col items-center justify-center transition-all duration-200 group relative border ${isActive
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white text-secondary border-transparent hover:bg-paper hover:text-primary'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />

                            {/* Tooltip */}
                            <span className="absolute left-full ml-2 px-2 py-1 bg-primary text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {tool.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
