import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MapEditor } from './components/MapEditor';
import { SettingCard } from './components/SettingCard';
import { MissionSettings, MeasurementSystem } from './types';
import { generateSmartSettings } from './services/geminiService';
import {
  Plane,
  Wind,
  Camera,
  ArrowLeftRight,
  RefreshCcw,
  AlignJustify,
  Image as ImageIcon,
  Zap,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Sparkles,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<MissionSettings>({
    altitude: 60,
    speed: 5.0,
    gimbalAngle: -90,
    pathDistance: 20,
    orientation: '南北向',
    overlap: 80,
    useActions: false,
    reversePoints: false,
    straightenPaths: true,
    correction: true,
  });

  const [sections, setSections] = useState({
    shape: true,
    premium: true,
    advanced: false
  });

  const [measurement, setMeasurement] = useState<MeasurementSystem>(MeasurementSystem.METRIC);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSmartGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    const result = await generateSmartSettings(aiPrompt);
    setIsGeneratingAI(false);

    if (result) {
      setSettings(prev => ({
        ...prev,
        altitude: result.altitude,
        speed: result.speed,
        gimbalAngle: result.gimbalAngle,
      }));
      setShowAiModal(false);
      // Optional: Add a toast notification here
      alert(`Updated settings: ${result.explanation}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-32">

        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">任務規劃</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            在地圖上選取區域以自動產生最佳化航點路徑。
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <div className="relative w-full sm:w-64">
            <select
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={measurement}
              onChange={(e) => setMeasurement(e.target.value as MeasurementSystem)}
            >
              <option>{MeasurementSystem.METRIC}</option>
              <option>{MeasurementSystem.IMPERIAL}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-violet-600 hover:to-fuchsia-700 transition-all shadow-md shadow-violet-200"
            >
              <Sparkles className="w-4 h-4" />
              AI 助手
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-lg font-medium transition-colors">
              <Download className="w-4 h-4" />
              匯入任務
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white hover:bg-slate-900 px-4 py-2.5 rounded-lg font-medium transition-colors">
              <Upload className="w-4 h-4" />
              匯入 KMZ
            </button>
          </div>
        </div>

        {/* AI Modal */}
        {showAiModal && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-violet-600">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-slate-900">AI 任務設定</h3>
                </div>
                <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-slate-600 text-sm">
                描述您的任務目標（例如：「快速測繪大型平坦農場」或「雕像細部檢測」）。
              </p>
              <textarea
                className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none text-slate-800"
                placeholder="輸入描述..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button
                onClick={handleSmartGenerate}
                disabled={isGeneratingAI}
                className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isGeneratingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : '自動配置設定'}
              </button>
            </div>
          </div>
        )}

        {/* Map Area */}
        <MapEditor />

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Settings Column */}
          <div className="lg:col-span-12 space-y-6">

            {/* Shape Generation Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('shape')}
                className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">飛行參數</h3>
                    <p className="text-sm text-slate-500">核心高度與速度設定</p>
                  </div>
                </div>
                {sections.shape ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
              </button>

              {sections.shape && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-t border-slate-100">
                  <SettingCard
                    label="飛行高度"
                    value={settings.altitude}
                    onChange={(v) => setSettings({ ...settings, altitude: v })}
                    icon={Plane}
                    unit="m"
                    min={20} max={500} step={1}
                    description="相對地面高度。請確保避開障礙物。"
                  />
                  <SettingCard
                    label="飛行速度"
                    value={settings.speed}
                    onChange={(v) => setSettings({ ...settings, speed: v })}
                    icon={Wind}
                    unit="m/s"
                    min={1} max={25} step={0.5}
                    description="較高速度可縮短飛行時間，但可能影響影像品質。"
                  />
                  <SettingCard
                    label="雲台角度"
                    value={settings.gimbalAngle}
                    onChange={(v) => setSettings({ ...settings, gimbalAngle: v })}
                    icon={Camera}
                    unit="deg"
                    min={-90} max={0} step={5}
                    description="-90° 為垂直向下 (Nadir)。0° 為水平向前。"
                  />
                  <SettingCard
                    label="路徑間距"
                    value={settings.pathDistance}
                    onChange={(v) => setSettings({ ...settings, pathDistance: v })}
                    icon={ArrowLeftRight}
                    unit="m"
                    min={5} max={100} step={1}
                    description="平行飛行路線之間的距離。影響重疊率。"
                  />
                </div>
              )}
            </div>

            {/* Premium Settings Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleSection('premium')}
                className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">進階控制</h3>
                    <p className="text-sm text-slate-500">專業任務微調</p>
                  </div>
                </div>
                {sections.premium ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
              </button>

              {sections.premium && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-t border-slate-100">
                  <SettingCard
                    label="方向"
                    value={settings.orientation}
                    onChange={(v) => setSettings({ ...settings, orientation: v })}
                    icon={AlignJustify}
                    type="select"
                    options={['南北向', '東西向', '自訂角度']}
                    description="飛行路線相對於地圖的方向。"
                  />
                  <SettingCard
                    label="影像重疊率"
                    value={settings.overlap}
                    onChange={(v) => setSettings({ ...settings, overlap: v })}
                    icon={ImageIcon}
                    unit="%"
                    min={20} max={90} step={5}
                    description="影像間的前向重疊率。3D 建構建議 70-80%。"
                  />
                  <SettingCard
                    label="反向路徑"
                    value={settings.reversePoints}
                    onChange={(v) => setSettings({ ...settings, reversePoints: v })}
                    icon={RefreshCcw}
                    type="toggle"
                    description="從終點開始並反向飛行。"
                  />
                  <SettingCard
                    label="動作點"
                    value={settings.useActions}
                    onChange={(v) => setSettings({ ...settings, useActions: v })}
                    icon={Zap}
                    type="toggle"
                    description="在每個航點執行動作（例如：懸停、拍照）。"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Sticky Call to Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500 hidden sm:block">
            預估飛行時間: <span className="font-bold text-slate-800">12m 30s</span> • 航點數: <span className="font-bold text-slate-800">42</span>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <div className="flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="任務名稱"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <button className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors">
              儲存
            </button>
            <button className="flex-1 px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 transform hover:-translate-y-0.5">
              產生
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;