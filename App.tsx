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
  });

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
      <MapEditor />
    </Layout>
  );
};

export default App;