import React, { useEffect, useState, useRef, useCallback } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary, ControlPosition } from '@vis.gl/react-google-maps';
import { Undo, Redo, RotateCcw, Upload, Search, Hexagon, Square, MapPin, MousePointer, Navigation } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface MapContainerProps {
    activeTool: string;
    onAreaChange?: (geoJson: any) => void;
}

// Custom Control Components
const TopBar = () => {
    return (
        <div className="absolute top-4 left-4 right-4 flex gap-2 z-10 pointer-events-none">
            <div className="flex-1 bg-white rounded-md shadow-md flex items-center p-1 pointer-events-auto">
                <Search className="w-5 h-5 text-gray-400 ml-2" />
                <input
                    type="text"
                    placeholder="Search for a location"
                    className="flex-1 px-3 py-1 outline-none text-sm"
                />
            </div>
            <div className="flex gap-2 pointer-events-auto">
                <button className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                    <Undo className="w-4 h-4" /> Undo
                </button>
                <button className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                    <Redo className="w-4 h-4" /> Redo
                </button>
                <button className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-1">
                    <RotateCcw className="w-4 h-4" /> Reset
                </button>
            </div>
        </div>
    );
};

const InstructionOverlay = ({ visible }: { visible: boolean }) => {
    if (!visible) return null;
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm px-8 py-6 shadow-xl text-center z-10 border border-primary/10 max-w-md pointer-events-none">
            <h3 className="text-xl font-serif font-bold text-primary mb-2">開始繪製區域</h3>
            <p className="text-base text-secondary">
                請使用多邊形、矩形或興趣點工具。<br />
                繪製完成後請點擊 <span className="font-bold text-primary">產生任務</span>。
            </p>
        </div>
    );
};

const MapManager = ({ activeTool, onAreaChange }: { activeTool: string, onAreaChange?: (geoJson: any) => void }) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const currentOverlay = useRef<google.maps.MVCObject | null>(null);

    // Initialize DrawingManager
    useEffect(() => {
        if (!map || !drawing) return;

        const dm = new drawing.DrawingManager({
            drawingControl: false, // We use custom toolbar
            polygonOptions: {
                fillColor: '#ffff00',
                fillOpacity: 0.3,
                strokeWeight: 2,
                clickable: true,
                editable: true,
                draggable: true,
            },
            rectangleOptions: {
                fillColor: '#ffff00',
                fillOpacity: 0.3,
                strokeWeight: 2,
                clickable: true,
                editable: true,
                draggable: true,
            },
            markerOptions: {
                draggable: true,
            }
        });

        dm.setMap(map);
        setDrawingManager(dm);

        return () => {
            dm.setMap(null);
        };
    }, [map, drawing]);

    // Handle Tool Changes
    useEffect(() => {
        if (!drawingManager) return;

        let mode: google.maps.drawing.OverlayType | null = null;
        switch (activeTool) {
            case 'polygon':
                mode = google.maps.drawing.OverlayType.POLYGON;
                break;
            case 'rectangle':
                mode = google.maps.drawing.OverlayType.RECTANGLE;
                break;
            case 'poi':
                mode = google.maps.drawing.OverlayType.MARKER;
                break;
            case 'waypoint':
                // Waypoint logic might differ, treating as marker for now
                mode = google.maps.drawing.OverlayType.MARKER;
                break;
            default:
                mode = null;
        }
        drawingManager.setDrawingMode(mode);

    }, [drawingManager, activeTool]);

    // Handle Overlay Complete
    useEffect(() => {
        if (!drawingManager) return;

        const updateArea = (overlay: any, type: google.maps.drawing.OverlayType) => {
            if (!onAreaChange) return;

            let geoJson: any = null;

            if (type === google.maps.drawing.OverlayType.POLYGON) {
                const path = overlay.getPath();
                const coordinates = [];
                for (let i = 0; i < path.getLength(); i++) {
                    const xy = path.getAt(i);
                    coordinates.push([xy.lng(), xy.lat()]);
                }
                if (coordinates.length > 0) coordinates.push(coordinates[0]); // Close loop

                geoJson = {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates: [coordinates] },
                    properties: {}
                };
            } else if (type === google.maps.drawing.OverlayType.RECTANGLE) {
                const bounds = overlay.getBounds();
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                const coordinates = [
                    [
                        [sw.lng(), sw.lat()],
                        [ne.lng(), sw.lat()],
                        [ne.lng(), ne.lat()],
                        [sw.lng(), ne.lat()],
                        [sw.lng(), sw.lat()]
                    ]
                ];
                geoJson = {
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates },
                    properties: {}
                };
            }

            if (geoJson) {
                onAreaChange(geoJson);
                console.log('Draw Update:', JSON.stringify(geoJson));
            }
        };

        const listener = google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
            // Clear previous overlay if exists (single shape mode)
            if (currentOverlay.current) {
                // @ts-ignore
                currentOverlay.current.setMap(null);
            }

            const overlay = event.overlay;
            currentOverlay.current = overlay;

            // Reset to select mode
            // NOTE: We don't reset activeTool here because it's controlled by parent.
            // But we can reset drawing mode on map manager.
            // Ideally parent should also reset activeTool to 'select' but for now we just stop drawing.
            drawingManager.setDrawingMode(null);

            updateArea(overlay, event.type);

            // Add listeners for edits
            if (event.type === google.maps.drawing.OverlayType.POLYGON) {
                const path = (overlay as google.maps.Polygon).getPath();
                ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
                    google.maps.event.addListener(path, evt, () => updateArea(overlay, event.type));
                });
            } else if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
                google.maps.event.addListener(overlay, 'bounds_changed', () => updateArea(overlay, event.type));
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [drawingManager, onAreaChange]);

    return null;
};

export const MapContainer: React.FC<MapContainerProps> = ({ activeTool, onAreaChange }) => {
    const [showInstruction, setShowInstruction] = useState(true);

    const handleAreaChange = useCallback((geoJson: any) => {
        if (geoJson) {
            setShowInstruction(false);
        }
        if (onAreaChange) {
            onAreaChange(geoJson);
        }
    }, [onAreaChange]);

    return (
        <div className="relative w-full h-full">
            <TopBar />
            <InstructionOverlay visible={showInstruction} />

            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={{ lat: 25.0, lng: 121.5 }}
                    defaultZoom={14}
                    mapId="DEMO_MAP_ID"
                    style={{ width: '100%', height: '100%' }}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true} // Disable default UI to use custom controls
                    mapTypeId={'hybrid'} // Hybrid shows satellite + roads/labels
                    clickableIcons={false} // Disable POI clickable icons
                    maxZoom={22} // Allow maximum zoom
                    tilt={0} // Force 2D view
                    heading={0} // Reset heading
                    reuseMaps={true}
                >
                    <MapManager activeTool={activeTool} onAreaChange={handleAreaChange} />
                </Map>
            </APIProvider>
        </div>
    );
};
