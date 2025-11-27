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

const App: React.FC = () => {
  // State
  const [activeTool, setActiveTool] = useState('select');
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
    if (!geoJson) return;

    // Distinguish between Area (Polygon/Rectangle) and POIs (Point/FeatureCollection)
    if (geoJson.type === 'FeatureCollection') {
      // It's likely POIs
      setMissionPOIs(geoJson.features);
    } else if (geoJson.geometry && (geoJson.geometry.type === 'Polygon' || geoJson.geometry.type === 'MultiPolygon')) {
      setMissionArea(geoJson);
    } else if (geoJson.geometry && geoJson.geometry.type === 'Point') {
      // Single POI? MapManager emits FeatureCollection for POIs usually, but let's handle single point if needed
      // For now assume MapManager handles the collection logic for POIs
      // If it's a Circle (Point with radius property), treat as Area?
      if (geoJson.properties && geoJson.properties.type === 'circle') {
        setMissionArea(geoJson);
      }
    }
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
        const waypoints = generateRectanglePath(bounds, settings);
        setGeneratedWaypoints(waypoints);
        console.log('Generated waypoints:', waypoints);
      });
    } else if (missionArea.properties && missionArea.properties.type === 'circle') {
      alert('圓形區域路徑生成尚未實作');
    } else {
      alert('目前僅支援矩形/多邊形區域產生路徑');
    }
  };

  const handleDownloadKMZ = async () => {
    if (generatedWaypoints.length === 0) {
      alert('請先產生任務路徑');
      return;
    }

    const { generateKML } = await import('./utils/flightPathUtils');
    const kmlContent = generateKML(generatedWaypoints, 'Mission');

    // Create blob and download
    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mission.kml'; // Saving as KML for now as it's text-based. KMZ requires zipping.
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const handleSaveMission = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const missionName = prompt('請輸入任務名稱', '未命名任務');
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
      setSettings(mission.settings);
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
            onSettingsChange={setSettings}
            onGenerate={handleGenerateMission}
            onDownload={handleDownloadKMZ}
            onSaveToAccount={handleSaveMission}
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