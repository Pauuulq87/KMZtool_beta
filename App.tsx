import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MapEditor } from './components/MapEditor';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { MissionSettings } from './types';
import { authService, User } from './services/authService';
import { missionService } from './services/missionService';

import { MissionModal } from './components/MissionModal';
import { getAvailableSpacingMeters } from './utils/flightPathUtils';

const App: React.FC = () => {
  // 工具：統一檔案下載流程
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 工具：將航點依指定大小分段，供分割下載使用
  const chunkWaypoints = <T,>(items: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  };

  // State
  const [activeTool, setActiveTool] = useState('select');
  const [settings, setSettings] = useState<MissionSettings>({
    altitude: 60,
    speed: 5.0,
    gimbalAngle: -90,
    pathDistance: 20,
    orientation: '南北向',
    overlap: 80,
    rotationAngle: 0,
    useActions: false,
    reversePoints: false,
    straightenPaths: true,
    correction: true,
    units: 'metric',
    interval: 2,
    actionType: 'none',
    maintainAltitude: false,
    generateEveryPoint: false,
    onCompletion: 'hover',
    splitMission: false,
  });

  const [missionArea, setMissionArea] = useState<any>(null);
  const [missionPOIs, setMissionPOIs] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const [generatedWaypoints, setGeneratedWaypoints] = useState<any[]>([]);
  const [loadedMissionArea, setLoadedMissionArea] = useState<any>(null);
  const [loadedPOIs, setLoadedPOIs] = useState<any[]>([]);
  const [availableSpacingMeters, setAvailableSpacingMeters] = useState<number | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          authService.logout();
        }
      }
    };
    checkAuth();
  }, []);

  const handleAreaChange = (geoJson: any) => {
    if (!geoJson) {
      setMissionArea(null);
      setMissionPOIs([]);
      setGeneratedWaypoints([]);
      setLoadedMissionArea(null);
      setLoadedPOIs([]);
      setAvailableSpacingMeters(null);
      return;
    }

    // Distinguish between Area (Polygon/Rectangle) and POIs (Point/FeatureCollection)
    if (geoJson.type === 'FeatureCollection') {
      // It's likely POIs
      setMissionPOIs(geoJson.features);
    } else if (geoJson.geometry && (geoJson.geometry.type === 'Polygon' || geoJson.geometry.type === 'MultiPolygon')) {
      setMissionArea(geoJson);
      const coords = geoJson.geometry.coordinates?.[0];
      const spacing = getAvailableSpacingMeters(coords, settings.rotationAngle, settings.orientation);
      setAvailableSpacingMeters(spacing);
    } else if (geoJson.geometry && geoJson.geometry.type === 'Point') {
      // Single POI? MapManager emits FeatureCollection for POIs usually, but let's handle single point if needed
      // For now assume MapManager handles the collection logic for POIs
      // If it's a Circle (Point with radius property), treat as Area?
      if (geoJson.properties && geoJson.properties.type === 'circle') {
        setMissionArea(geoJson);
      }
    }
  };

  // 依照可用寬度自動收斂重疊率與間距
  useEffect(() => {
    if (!missionArea || !missionArea.geometry) return;
    const coords = missionArea.geometry.coordinates?.[0];
    const spacing = getAvailableSpacingMeters(coords, settings.rotationAngle, settings.orientation);
    setAvailableSpacingMeters(spacing);
  }, [missionArea, settings.rotationAngle, settings.orientation]);

  // 可用寬度更新時，強制收斂間距與重疊率
  useEffect(() => {
    if (!availableSpacingMeters || availableSpacingMeters <= 0) return;
    setSettings((prev) => {
      const width = availableSpacingMeters;
      const clampedSpacing = Math.min(prev.pathDistance, width);
      const derivedOverlap = Math.max(0, Math.min(95, Math.round((1 - clampedSpacing / width) * 100)));

      if (clampedSpacing === prev.pathDistance && derivedOverlap === prev.overlap) return prev;
      return { ...prev, pathDistance: clampedSpacing, overlap: derivedOverlap };
    });
  }, [availableSpacingMeters]);

  // 設定調整：重疊率與間距雙向同步並尊重可用寬度
  const handleSettingsChange = (partial: Partial<MissionSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial } as MissionSettings;

      const width = availableSpacingMeters ?? null;
      if (width && width > 0) {
        if (partial.overlap !== undefined) {
          const safeOverlap = Math.min(95, Math.max(0, Number(partial.overlap)));
          const spacingByOverlap = Math.max(0.5, Math.min(width, parseFloat((width * (1 - safeOverlap / 100)).toFixed(2))));
          next.overlap = safeOverlap;
          next.pathDistance = spacingByOverlap;
        } else if (partial.pathDistance !== undefined) {
          const requestedSpacing = Math.max(0.5, Math.min(width, Number(partial.pathDistance)));
          const derivedOverlap = Math.max(0, Math.min(95, Math.round((1 - requestedSpacing / width) * 100)));
          next.pathDistance = requestedSpacing;
          next.overlap = derivedOverlap;
        } else {
          next.pathDistance = Math.min(next.pathDistance, width);
        }
      }

      return next;
    });
  };

  const handleGenerateMission = () => {
    if (!missionArea) {
      alert('請先在地圖上繪製區域');
      return;
    }

    // Check if it's a polygon/rectangle
    if (missionArea.geometry.type === 'Polygon') {
      // Calculate bounds from coordinates
      const coords = missionArea.geometry.coordinates[0];
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

      coords.forEach((p: number[]) => {
        const lng = p[0];
        const lat = p[1];
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      });

      const bounds = {
        north: maxLat,
        south: minLat,
        east: maxLng,
        west: minLng
      };

      // Dynamic import to avoid circular dependency issues if any, or just standard import
      import('./utils/flightPathUtils').then(({ generateRectanglePath }) => {
        const polygonCoords = missionArea.geometry.coordinates?.[0];
        const waypoints = generateRectanglePath(bounds, settings, polygonCoords);
        setGeneratedWaypoints(waypoints);
        console.log('Generated waypoints:', waypoints);
      });
    } else if (missionArea.properties && missionArea.properties.type === 'circle') {
      alert('圓形區域路徑生成尚未實作');
    } else {
      alert('目前僅支援矩形/多邊形區域產生路徑');
    }
  };

  // 監聽核心參數變化即時重算路徑
  useEffect(() => {
    if (!missionArea) return;
    handleGenerateMission();
  }, [missionArea, settings.overlap, settings.pathDistance, settings.rotationAngle, settings.orientation]);

  const handleDownloadKMZ = async (customName?: string) => {
    if (generatedWaypoints.length === 0) {
      alert('請先產生路徑');
      return;
    }

    const { generateKML } = await import('./utils/flightPathUtils');
    const missionName = (customName || 'mission').trim();
    const mimeType = 'application/vnd.google-earth.kml+xml';
    const chunkSize = 200;

    if (settings.splitMission && generatedWaypoints.length > chunkSize) {
      const segments = chunkWaypoints(generatedWaypoints, chunkSize);
      segments.forEach((segment, index) => {
        const kmlContent = generateKML(segment, `${missionName}-part-${index + 1}`, {
          onCompletion: settings.onCompletion,
          segmentIndex: index + 1,
          totalSegments: segments.length,
        });
        downloadBlob(new Blob([kmlContent], { type: mimeType }), `${missionName}-part-${index + 1}.kml`);
      });
      alert(`已分割為 ${segments.length} 個檔案並開始下載`);
    } else {
      const kmlContent = generateKML(generatedWaypoints, missionName, { onCompletion: settings.onCompletion });
      downloadBlob(new Blob([kmlContent], { type: mimeType }), `${missionName}.kml`);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentMissionId(null);
  };

  const handleSaveMission = async (providedName?: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const missionName = (providedName || prompt('請輸入任務名稱', '未命名任務') || '').trim();
    if (!missionName) return;

    try {
      const missionData = {
        name: missionName,
        settings,
        waypoints: generatedWaypoints,
        pois: missionPOIs,
        area: missionArea,
      };

      if (currentMissionId) {
        await missionService.update(currentMissionId, missionData);
        alert('任務更新成功！');
      } else {
        const newMission = await missionService.create(missionData);
        setCurrentMissionId(newMission.id);
        alert('任務儲存成功！');
      }
    } catch (error) {
      console.error('Save mission failed:', error);
      alert('儲存失敗，請稍後再試');
    }
  };

  const handleLoadMission = async (missionId: string) => {
    try {
      const mission = await missionService.getById(missionId);
      setSettings({
        rotationAngle: 0,
        ...mission.settings,
      });
      setCurrentMissionId(mission.id);
      if (mission.waypoints) {
        setGeneratedWaypoints(mission.waypoints);
      }
      if (mission.pois) {
        setMissionPOIs(mission.pois);
        setLoadedPOIs(mission.pois);
      }
      if (mission.area) {
        setMissionArea(mission.area);
        setLoadedMissionArea(mission.area);
      }
      // Note: missionArea restoration is handled by passing it to MapEditor
      // We added `area` to the save payload.

      console.log('Loaded mission:', mission);
      alert('任務載入成功！');
    } catch (error) {
      console.error('Load mission failed:', error);
      alert('載入失敗');
    }
  };

  // 下載自動安裝程式占位檔：提供操作指引
  const handleDownloadInstaller = () => {
    const instructions = [
      'KMZ 自動安裝程式 V2 (指引占位檔)',
      '目前安裝程式仍在處理防毒誤報，請改用以下方式：',
      '1. 下載 mission.kml 後以 OpenMTP 將檔案放入裝置。',
      '2. 如需自動化腳本，可聯繫專案維護者取得測試版。',
      `產生時間：${new Date().toISOString()}`,
    ].join('\n');

    downloadBlob(new Blob([instructions], { type: 'text/plain' }), 'KMZ-installer-guide.txt');
    alert('已提供暫時指引檔，正式安裝程式完成後可直接更新下載連結。');
  };

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
      />
      <Layout
        sidebar={
          <Sidebar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onSave={handleSaveMission}
            onLoad={() => {
              if (!user) {
                setIsAuthModalOpen(true);
                return;
              }
              setIsMissionModalOpen(true);
            }}
          />
        }
        propertiesPanel={
          <PropertiesPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onGenerate={handleGenerateMission}
            onDownload={handleDownloadKMZ}
            onSaveToAccount={handleSaveMission}
            onDownloadInstaller={handleDownloadInstaller}
            availableSpacingMeters={availableSpacingMeters}
          />
        }
      >
        <MapEditor
          activeTool={activeTool}
          onAreaChange={handleAreaChange}
          waypoints={generatedWaypoints}
          initialArea={loadedMissionArea}
          initialPOIs={loadedPOIs}
        />
      </Layout>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onLoadMission={handleLoadMission}
      />
    </>
  );
};

export default App;
