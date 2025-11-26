import React from 'react';
import { MissionSettings } from '../types';
import { Plane, Wind, Camera, ArrowLeftRight, ChevronRight } from 'lucide-react';

interface PropertiesPanelProps {
    settings: MissionSettings;
    onSettingsChange: (settings: MissionSettings) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ settings, onSettingsChange }) => {

    const updateSetting = (key: keyof MissionSettings, value: number | string | boolean) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="h-full w-80 bg-white border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-slate-800">屬性面板</h2>
                <button className="p-1 hover:bg-slate-200 rounded text-slate-500">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Mission Settings Group */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">全域設定</h3>

                    {/* Altitude */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="text-slate-600 flex items-center gap-2">
                                <Plane className="w-4 h-4" /> 飛行高度
                            </label>
                            <span className="font-mono font-medium text-slate-900">{settings.altitude} m</span>
                        </div>
                        <input
                            type="range"
                            min="20" max="500"
                            value={settings.altitude}
                            onChange={(e) => updateSetting('altitude', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Speed */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="text-slate-600 flex items-center gap-2">
                                <Wind className="w-4 h-4" /> 飛行速度
                            </label>
                            <span className="font-mono font-medium text-slate-900">{settings.speed} m/s</span>
                        </div>
                        <input
                            type="range"
                            min="1" max="25" step="0.5"
                            value={settings.speed}
                            onChange={(e) => updateSetting('speed', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Spacing */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="text-slate-600 flex items-center gap-2">
                                <ArrowLeftRight className="w-4 h-4" /> 路徑間距
                            </label>
                            <span className="font-mono font-medium text-slate-900">{settings.pathDistance} m</span>
                        </div>
                        <input
                            type="range"
                            min="5" max="100"
                            value={settings.pathDistance}
                            onChange={(e) => updateSetting('pathDistance', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    {/* Gimbal */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="text-slate-600 flex items-center gap-2">
                                <Camera className="w-4 h-4" /> 雲台角度
                            </label>
                            <span className="font-mono font-medium text-slate-900">{settings.gimbalAngle}°</span>
                        </div>
                        <input
                            type="range"
                            min="-90" max="0" step="5"
                            value={settings.gimbalAngle}
                            onChange={(e) => updateSetting('gimbalAngle', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Mission Stats */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">任務摘要</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">預估時間</div>
                            <div className="font-bold text-slate-800">12m 30s</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">總距離</div>
                            <div className="font-bold text-slate-800">4.2 km</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">航點數</div>
                            <div className="font-bold text-slate-800">42</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-xs text-slate-500 mb-1">照片數</div>
                            <div className="font-bold text-slate-800">~150</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                    匯出 KML
                </button>
                <button className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors">
                    儲存任務
                </button>
            </div>
        </div>
    );
};
