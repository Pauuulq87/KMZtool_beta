import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { MapEditor } from './components/MapEditor';
import { MissionSettings } from './types';

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

  const handleAreaChange = (geoJson: any) => {
    setMissionArea(geoJson);
  };

  return (
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
          onSettingsChange={setSettings}
        />
      }
    >
      <MapEditor activeTool={activeTool} onAreaChange={handleAreaChange} />
    </Layout>
  );
};

export default App;