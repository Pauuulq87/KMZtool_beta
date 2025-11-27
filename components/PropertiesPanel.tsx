import React, { useState } from 'react';
import { MissionSettings } from '../types';
import { HelpCircle } from 'lucide-react';

interface PropertiesPanelProps {
    settings: MissionSettings;
    onSettingsChange: (settings: MissionSettings) => void;
    onGenerate?: () => void;
    onDownload?: (missionName?: string) => void;
    onSaveToAccount?: (missionName?: string) => void;
    onDownloadInstaller?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ settings, onSettingsChange, onGenerate, onDownload, onSaveToAccount, onDownloadInstaller }) => {
    const [activeTab, setActiveTab] = useState<'params' | 'download'>('params');
    const [presetName, setPresetName] = useState('');
    const [missionName, setMissionName] = useState('');

    const updateSetting = (key: keyof MissionSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
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

    // 儲存至帳號：帶入任務名稱並呼叫外層邏輯
    const handleSaveToAccount = () => {
        if (!missionName.trim()) {
            alert('請先輸入任務名稱');
            return;
        }
        onSaveToAccount?.(missionName.trim());
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
                    下載
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'params' && (
                    <div className="space-y-8 max-w-2xl mx-auto">
                        <div className="bg-paper p-6 border border-primary/10">
                            <h3 className="text-base font-serif font-bold text-primary mb-6">品質與路徑</h3>
                            <div className="mb-2 flex justify-between items-end">
                                <label className="text-sm font-medium text-secondary">重疊率</label>
                                <span className="text-2xl font-bold text-secondary">{settings.overlap}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                value={settings.overlap}
                                onChange={(e) => updateSetting('overlap', Number(e.target.value))}
                                className="w-full h-2 bg-primary/20 appearance-none cursor-pointer accent-primary mb-2"
                            />
                            <div className="flex justify-between text-xs text-secondary font-medium uppercase tracking-wide">
                                <span>快速 (低重疊)</span>
                                <span>高品質 (高重疊)</span>
                            </div>

                            <div className="mt-6 mb-2 flex justify-between items-end">
                                <label className="text-sm font-medium text-secondary">旋轉路徑</label>
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
                                <span>0° 直向（左）</span>
                                <span>360° 完整旋轉</span>
                            </div>
                        </div>

                        <div className="bg-secondary/10 p-4 border border-secondary/20 text-sm text-secondary flex gap-3 items-start">
                            <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                重疊率影響間距，旋轉角度 0°~360° 可微調掃描方向；調整後點「產生路徑」重新套用。
                            </p>
                        </div>

                        <div className="space-y-8">

                        {/* Section 1: Flight Parameters */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-serif font-bold text-secondary uppercase tracking-wider border-b border-primary/10 pb-2">飛行參數</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        單位 <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                                    </label>
                                    <select
                                        value={settings.units}
                                        onChange={(e) => updateSetting('units', e.target.value)}
                                        className="w-full p-2.5 bg-white border border-primary/20 text-primary focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                                    >
                                        <option value="metric">公制 (m)</option>
                                        <option value="imperial">英制 (ft)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        高度 <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                                    </label>
                                    <div className="flex border border-primary/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        <input
                                            type="number"
                                            value={settings.altitude}
                                            onChange={(e) => updateSetting('altitude', Number(e.target.value))}
                                            className="w-full p-2.5 border-none focus:outline-none"
                                        />
                                        <span className="bg-paper px-4 flex items-center text-secondary font-medium text-sm border-l border-primary/20">
                                            {settings.units === 'metric' ? 'm' : 'ft'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        速度 <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                                    </label>
                                    <div className="flex border border-primary/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        <input
                                            type="number"
                                            value={settings.speed}
                                            onChange={(e) => updateSetting('speed', Number(e.target.value))}
                                            className="w-full p-2.5 border-none focus:outline-none"
                                        />
                                        <span className="bg-paper px-4 flex items-center text-secondary font-medium text-sm border-l border-primary/20">
                                            m/s
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        路徑間距 <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                                    </label>
                                    <div className="flex border border-primary/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        <input
                                            type="number"
                                            value={settings.pathDistance}
                                            onChange={(e) => updateSetting('pathDistance', Number(e.target.value))}
                                            className="w-full p-2.5 border-none focus:outline-none"
                                        />
                                        <span className="bg-paper px-4 flex items-center text-secondary font-medium text-sm border-l border-primary/20">
                                            m
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Camera & Path */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-serif font-bold text-secondary uppercase tracking-wider border-b border-primary/10 pb-2">相機與路徑</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        航線方向 <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                                    </label>
                                    <select
                                        value={settings.orientation}
                                        onChange={(e) => updateSetting('orientation', e.target.value)}
                                        className="w-full p-2.5 bg-white border border-primary/20 text-primary focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                                    >
                                        <option value="南北向">東西向 (0°)</option>
                                        <option value="東西向">南北向 (90°)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        影像重疊率
                                    </label>
                                    <div className="flex border border-primary/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        <input
                                            type="number"
                                            value={settings.overlap}
                                            onChange={(e) => updateSetting('overlap', Number(e.target.value))}
                                            className="w-full p-2.5 border-none focus:outline-none"
                                        />
                                        <span className="bg-paper px-4 flex items-center text-secondary font-medium text-sm border-l border-primary/20">
                                            %
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        快門間隔
                                    </label>
                                    <div className="flex border border-primary/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        <input
                                            type="number"
                                            value={settings.interval}
                                            onChange={(e) => updateSetting('interval', Number(e.target.value))}
                                            className="w-full p-2.5 border-none focus:outline-none"
                                        />
                                        <span className="bg-paper px-4 flex items-center text-secondary font-medium text-sm border-l border-primary/20">
                                            s
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        雲台角度
                                    </label>
                                    <div className="flex border border-primary/20 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        <input
                                            type="number"
                                            value={settings.gimbalAngle}
                                            onChange={(e) => updateSetting('gimbalAngle', Number(e.target.value))}
                                            className="w-full p-2.5 border-none focus:outline-none"
                                        />
                                        <span className="bg-paper px-4 flex items-center text-secondary font-medium text-sm border-l border-primary/20">
                                            deg
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1 text-sm font-medium text-primary">
                                        航點動作
                                    </label>
                                    <select
                                        value={settings.actionType}
                                        onChange={(e) => updateSetting('actionType', e.target.value)}
                                        className="w-full p-2.5 bg-white border border-primary/20 text-primary focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
                                    >
                                        <option value="none">無動作</option>
                                        <option value="photo">拍照</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Advanced Options (Toggles) */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-serif font-bold text-secondary uppercase tracking-wider border-b border-primary/10 pb-2">進階選項</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div className="flex items-center justify-between p-3 bg-paper border border-primary/10">
                                    <label className="text-sm font-medium text-primary">維持高度</label>
                                    <button
                                        onClick={() => updateSetting('maintainAltitude', !settings.maintainAltitude)}
                                        className={`w-11 h-6 relative transition-colors duration-200 focus:outline-none ${settings.maintainAltitude ? 'bg-secondary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white shadow-sm transition-all duration-200 ${settings.maintainAltitude ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-paper border border-primary/10">
                                    <label className="text-sm font-medium text-primary">直線飛行</label>
                                    <button
                                        onClick={() => updateSetting('straightenPaths', !settings.straightenPaths)}
                                        className={`w-11 h-6 relative transition-colors duration-200 focus:outline-none ${settings.straightenPaths ? 'bg-secondary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white shadow-sm transition-all duration-200 ${settings.straightenPaths ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-paper border border-primary/10">
                                    <label className="text-sm font-medium text-primary">產生所有點</label>
                                    <button
                                        onClick={() => updateSetting('generateEveryPoint', !settings.generateEveryPoint)}
                                        className={`w-11 h-6 relative transition-colors duration-200 focus:outline-none ${settings.generateEveryPoint ? 'bg-secondary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white shadow-sm transition-all duration-200 ${settings.generateEveryPoint ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-paper border border-primary/10">
                                    <label className="text-sm font-medium text-primary">反向路徑</label>
                                    <button
                                        onClick={() => updateSetting('reversePoints', !settings.reversePoints)}
                                        className={`w-11 h-6 relative transition-colors duration-200 focus:outline-none ${settings.reversePoints ? 'bg-secondary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white shadow-sm transition-all duration-200 ${settings.reversePoints ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Save Preset */}
                        <div className="pt-6 border-t border-primary/10 space-y-3">
                            <label className="block text-sm font-bold text-primary">儲存預設值</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="例如：70m 慢速測繪"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    className="flex-1 p-2.5 bg-paper border border-primary/20 text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    onClick={handleSavePreset}
                                    className="px-6 py-2.5 bg-white border border-primary/20 text-primary hover:bg-paper font-medium shadow-sm transition-colors"
                                >
                                    儲存
                                </button>
                            </div>
                            <p className="text-xs text-secondary">
                                預設值將儲存在您的瀏覽器中。
                            </p>
                        </div>

                        </div>

                        <button
                            onClick={onGenerate}
                            className="w-full py-4 bg-secondary hover:bg-primary text-white font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            產生路徑
                        </button>
                    </div>
                )}

                {activeTab === 'download' && (
                    <div className="space-y-8 max-w-2xl mx-auto">
                        <div>
                            <h2 className="text-xl font-serif font-bold text-primary">下載與儲存</h2>
                            <p className="text-secondary mt-1">下載最終的 DJI .KMZ 檔案</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-primary">任務完成後</label>
                                <select
                                    value={settings.onCompletion}
                                    onChange={(e) => updateSetting('onCompletion', e.target.value)}
                                    className="w-full p-3 bg-white border border-primary/20 text-primary focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                                >
                                    <option value="hover">懸停 (Hover)</option>
                                    <option value="returnToHome">自動返航 (Return to home)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateSetting('splitMission', !settings.splitMission)}
                                    className={`w-11 h-6 relative transition-colors duration-200 focus:outline-none ${settings.splitMission ? 'bg-secondary' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white shadow-sm transition-all duration-200 ${settings.splitMission ? 'left-6' : 'left-1'}`} />
                                </button>
                                <span className="text-sm font-medium text-primary">分割任務</span>
                            </div>

                            <div className="text-sm font-medium text-secondary">
                                預估任務時間：<span className="text-primary">—</span>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleDownload}
                                    className="w-full py-3 bg-secondary hover:bg-primary text-white font-bold text-lg transition-colors shadow-md"
                                >
                                    下載 KMZ
                                </button>
                                <button
                                    onClick={onDownloadInstaller}
                                    className="w-full py-3 bg-secondary/90 hover:bg-secondary text-white font-bold text-sm transition-colors shadow-md flex flex-col items-center justify-center gap-0.5"
                                >
                                    <span>下載 KMZ 自動安裝程式 V2 (Windows)</span>
                                    <span className="font-normal text-xs opacity-90">(正在解決防毒軟體誤報問題)</span>
                                </button>
                            </div>

                            <p className="text-sm text-secondary">
                                Mac 使用者需安裝 <a href="#" className="text-secondary hover:underline font-bold">OpenMTP</a> 並手動替換檔案
                            </p>
                        </div>

                        <div className="pt-8 border-t border-primary/10 space-y-4">
                            <h3 className="text-lg font-serif font-bold text-primary">儲存任務至帳號</h3>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="任務名稱"
                                    value={missionName}
                                    onChange={(e) => setMissionName(e.target.value)}
                                    className="flex-1 p-3 bg-white border border-primary/20 text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <button
                                    onClick={handleSaveToAccount}
                                    className="px-8 py-3 bg-secondary hover:bg-primary text-white font-bold shadow-md transition-colors"
                                >
                                    儲存
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
