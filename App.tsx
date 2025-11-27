import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MapEditor } from './components/MapEditor';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { MissionSettings } from './types';
import { authService, User } from './services/authService';

import { getAvailableSpacingMeters, generateCirclePath, generateRectanglePath, generateKML } from './utils/flightPathUtils';

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
  const [generatedWaypoints, setGeneratedWaypoints] = useState<any[]>([]);
  const [loadedMissionArea, setLoadedMissionArea] = useState<any>(null);
  const [loadedPOIs, setLoadedPOIs] = useState<any[]>([]);
  const [availableSpacingMeters, setAvailableSpacingMeters] = useState<number | null>(null);
  const [estimatedTimeText, setEstimatedTimeText] = useState<string>('—');

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
      const spacing = getAvailableSpacingMeters(coords, settings);
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

  // 計算預估飛行時間（僅以航點連線長度/速度估算）
  const computeEstimatedTime = (waypoints: any[], speed: number) => {
    if (!waypoints || waypoints.length < 2 || speed <= 0) return '—';

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    let distanceMeters = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const R = 6371e3;
      const phi1 = toRad(p1.lat);
      const phi2 = toRad(p2.lat);
      const dPhi = toRad(p2.lat - p1.lat);
      const dLambda = toRad(p2.lng - p1.lng);
      const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceMeters += R * c;
    }

    const seconds = distanceMeters / speed;
    const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  // 依照可用寬度自動收斂重疊率與間距
  useEffect(() => {
    if (!missionArea || !missionArea.geometry) return;
    const coords = missionArea.geometry.coordinates?.[0];
    const spacing = getAvailableSpacingMeters(coords, settings);
    setAvailableSpacingMeters(spacing);
  }, [missionArea, settings.rotationAngle, settings.orientation]);

  // 可用寬度更新時，強制收斂間距與重疊率

  // 可用寬度更新時，強制收斂間距與重疊率
  useEffect(() => {
    if (!availableSpacingMeters || availableSpacingMeters <= 0) return;
    setSettings((prev) => {
      const width = availableSpacingMeters;
      const clampedSpacing = Math.min(prev.pathDistance, width);
      const derivedOverlap = Math.max(20, Math.min(95, Math.round((1 - clampedSpacing / width) * 100)));

      if (clampedSpacing === prev.pathDistance && derivedOverlap === prev.overlap) return prev;
      return { ...prev, pathDistance: clampedSpacing, overlap: derivedOverlap };
    });
  }, [availableSpacingMeters]);

  // 估算時間：航點或速度變動時更新
  useEffect(() => {
    setEstimatedTimeText(computeEstimatedTime(generatedWaypoints, settings.speed));
  }, [generatedWaypoints, settings.speed]);

  // 設定調整：重疊率與間距雙向同步並尊重可用寬度
  const handleSettingsChange = (partial: Partial<MissionSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial } as MissionSettings;

      const width = availableSpacingMeters ?? null;
      if (width && width > 0) {
        if (partial.overlap !== undefined) {
          const safeOverlap = Math.min(95, Math.max(20, Number(partial.overlap)));
          const spacingByOverlap = Math.max(0.5, Math.min(width, parseFloat((width * (1 - safeOverlap / 100)).toFixed(2))));
          next.overlap = safeOverlap;
          next.pathDistance = spacingByOverlap;
        } else if (partial.pathDistance !== undefined) {
          const requestedSpacing = Math.max(0.5, Math.min(width, Number(partial.pathDistance)));
          const derivedOverlap = Math.max(20, Math.min(95, Math.round((1 - requestedSpacing / width) * 100)));
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

      const polygonCoords = missionArea.geometry.coordinates?.[0];
      const waypoints = generateRectanglePath(bounds, settings, polygonCoords);
      setGeneratedWaypoints(waypoints);
      console.log('Generated waypoints:', waypoints);
    } else if (missionArea.properties && missionArea.properties.type === 'circle') {
      const radius = missionArea.properties.radius;
      const centerLng = missionArea.geometry.coordinates?.[0];
      const centerLat = missionArea.geometry.coordinates?.[1];
      if (!radius || !centerLng || !centerLat) {
        alert('圓形資訊不足，請重新繪製');
        return;
      }
      const waypoints = generateCirclePath({ lat: centerLat, lng: centerLng }, radius, settings);
      setGeneratedWaypoints(waypoints);
      console.log('Generated circle waypoints:', waypoints);
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

    const missionName = (customName || 'mission').trim();
    const mimeType = 'application/vnd.google-earth.kml+xml';
    const chunkSize = 200;

    const kmlContent = generateKML(generatedWaypoints, missionName, { onCompletion: settings.onCompletion });
    downloadBlob(new Blob([kmlContent], { type: mimeType }), `${missionName}.kml`);
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
          />
        }
        propertiesPanel={
          <PropertiesPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onGenerate={handleGenerateMission}
            onDownload={handleDownloadKMZ}
            availableSpacingMeters={availableSpacingMeters}
            estimatedTimeText={estimatedTimeText}
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
    </>
  );
};

export default App;
