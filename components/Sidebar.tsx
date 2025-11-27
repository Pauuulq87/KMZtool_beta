import React, { useRef } from 'react';
import { Pentagon, Square, MapPin, MousePointer2, MousePointer, Upload, Circle } from 'lucide-react';

interface SidebarProps {
    activeTool: string;
    onToolChange: (tool: string) => void;
    onImport?: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolChange, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tools = [
        { id: 'polygon', icon: Pentagon, label: '多邊形' },
        { id: 'rectangle', icon: Square, label: '矩形' },
        { id: 'poi', icon: MapPin, label: '興趣點' },
        { id: 'circle', icon: Circle, label: 'POI (圓形)' },
    ];

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onImport) {
            onImport(file);
        }
        // Reset input value to allow selecting the same file again
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="h-full w-16 bg-white border-r border-primary/10 flex flex-col items-center py-4 gap-4 z-20 relative shadow-xl">
            {/* Import Button */}
            <div className="w-full px-2 mb-2">
                <button
                    onClick={handleImportClick}
                    className="w-full aspect-square flex flex-col items-center justify-center bg-paper text-secondary hover:bg-secondary hover:text-white transition-colors group relative border border-primary/10"
                    title="匯入 KMZ/KML"
                >
                    <Upload className="w-6 h-6" />
                    <span className="absolute left-full ml-2 px-2 py-1 bg-primary text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        匯入
                    </span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".kmz,.kml"
                    className="hidden"
                />
            </div>

            <div className="w-8 h-px bg-primary/10" />

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
