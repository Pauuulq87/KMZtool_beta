import React, { useState } from 'react';
import { MissionSettings } from '../types';
import { HelpCircle } from 'lucide-react';

interface PropertiesPanelProps {
    settings: MissionSettings;
    onSettingsChange: (settings: Partial<MissionSettings>) => void;
    onGenerate?: () => void;
    onDownload?: (missionName?: string) => void;
    availableSpacingMeters?: number | null;
    estimatedTimeText?: string;
    t: any;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ settings, onSettingsChange, onGenerate, onDownload, availableSpacingMeters, estimatedTimeText, t }) => {
    const [activeTab, setActiveTab] = useState<'params' | 'download'>('params');
    const [presetName, setPresetName] = useState('');
    const [missionName, setMissionName] = useState('');

    const updateSetting = (key: keyof MissionSettings, value: any) => {
        onSettingsChange({ [key]: value } as Partial<MissionSettings>);
    };

    // 儲存進階設定為瀏覽器端預設值
    const handleSavePreset = () => {
        const name = presetName.trim();
        if (!name) {
            alert('請輸入預設名稱');
            return;
        }
        const existing = localStorage.getItem('missionPresets');
        const list = existing ? JSON.parse(existing) : [];
        const next = [...list.filter((item: any) => item?.name !== name), { name, settings }];
        localStorage.setItem('missionPresets', JSON.stringify(next));
        alert(`已儲存預設：「${name}」`);
    };

    // 下載按鈕：帶入使用者輸入的任務名稱
    const handleDownload = () => {
        onDownload?.(missionName.trim() || undefined);
    };

    return (
        <div className="h-full w-[600px] bg-white border-l border-primary/10 flex flex-col font-sans text-primary transition-all duration-300">
            {/* Tabs */}
            <div className="flex border-b border-primary/10">
                <button
                    onClick={() => setActiveTab('params')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'params'
                        ? 'text-primary border-b-2 border-primary bg-paper'
                        : 'text-secondary hover:text-primary hover:bg-paper/50'
                        }`}
                >
                    參數
                </button>
                <button
                    onClick={() => setActiveTab('download')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'download'
                        ? 'text-primary border-b-2 border-primary bg-paper'
                        : 'text-secondary hover:text-primary hover:bg-paper/50'
                        }`}
                >
                    {t['download_save']}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                {activeTab === 'params' && (
                    <div className="space-y-8 max-w-2xl mx-auto w-full flex-1">
                        <div className="bg-paper p-6 border border-primary/10">
                            <h3 className="text-base font-serif font-bold text-primary mb-6">{t['quality_path']}</h3>
                            <div className="mb-2 flex justify-between items-end">
                                <label className="text-sm font-medium text-secondary">{t['overlap_spacing']}</label>
                                <span className="text-2xl font-bold text-secondary">{settings.overlap}%</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="95"
                                step={5}
                                value={settings.overlap}
                                onChange={(e) => updateSetting('overlap', Number(e.target.value))}
                                className="w-full h-2 bg-primary/20 appearance-none cursor-pointer accent-primary mb-2"
                            />
                            <div className="flex justify-between text-xs text-secondary font-medium uppercase tracking-wide">
                                <span>{t['fast_low_overlap']}</span>
                                <span>{t['high_quality']}</span>
                            </div>

                            <div className="mt-2 text-sm text-secondary font-medium">
                                {t['estimated_time']}：{estimatedTimeText || '—'}
                            </div>

                            <div className="mt-3 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-primary">{t['path_spacing']}</label>
                                    <span className="text-xs text-secondary">{t['max']} {availableSpacingMeters ? `${availableSpacingMeters.toFixed(1)} m` : '—'}</span>
                                </div>
                                <div className="flex border border-primary/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                    <input
                                        type="number"
                                        min={0.5}
                                        max={availableSpacingMeters ?? undefined}
                                        value={settings.pathDistance}
                                        onChange={(e) => updateSetting('pathDistance', Number(e.target.value))}
                                        className="w-full p-2.5 border-none focus:outline-none"
                                    />
                                    <span className="bg-paper px-4 flex items-center text-secondary font-medium text-sm border-l border-primary/20">
                                        m
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 mb-2 flex justify-between items-end">
                                <label className="text-sm font-medium text-secondary">{t['rotate_path']}</label>
                                <span className="text-2xl font-bold text-secondary">{settings.rotationAngle}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={settings.rotationAngle}
                                onChange={(e) => updateSetting('rotationAngle', Number(e.target.value))}
                                className="w-full h-2 bg-primary/20 appearance-none cursor-pointer accent-primary mb-2"
                            />
                            <div className="flex justify-between text-xs text-secondary font-medium">
                                <span>{t['vertical']}</span>
                                <span>{t['full_rotation']}</span>
                            </div>
                        </div>

                        <div className="bg-secondary/10 p-4 border border-secondary/20 text-sm text-secondary flex gap-3 items-start">
                            <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                {t['overlap_spacing_desc']}
                            </p>
                        </div>

                        {/* Disclaimer instead of Flight Params */}
                        <div className="bg-blue-50 p-6 border border-blue-100 rounded-lg text-center">
                            <p className="text-blue-800 font-medium leading-relaxed">
                                {t['advanced_options_notice']}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'download' && (
                    <div className="space-y-8 max-w-2xl mx-auto w-full">
                        <div>
                            <h2 className="text-xl font-serif font-bold text-primary">{t['download_save']}</h2>
                            <p className="text-secondary mt-1">{t['download_desc']}</p>
                            <p className="text-secondary text-sm mt-1">{t['estimated_time']}：{estimatedTimeText || '—'}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-6 bg-secondary hover:bg-primary text-white font-bold text-2xl transition-colors shadow-md rounded-lg"
                                >
                                    {t['download_kmz']}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-8 text-center">
                    <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                        {t['footer_text']}
                    </p>
                </div>
            </div>
        </div>
    );
};
