import React, { useEffect, useState, useRef, useCallback } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary, ControlPosition } from '@vis.gl/react-google-maps';
import { Undo, Redo, RotateCcw, Upload, Search, Hexagon, Square, MapPin, MousePointer, Navigation } from 'lucide-react';
import { POIInfoWindow, POIData } from './POIInfoWindow';

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

    // POI State
    const poiSequence = useRef<{ markers: google.maps.Marker[], polyline: google.maps.Polyline | null }>({ markers: [], polyline: null });
    const [selectedMarker, setSelectedMarker] = useState<google.maps.Marker | null>(null);

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
            circleOptions: {
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
        if (!drawingManager || !drawing) return;

        let mode: google.maps.drawing.OverlayType | null = null;
        switch (activeTool) {
            case 'polygon':
                mode = drawing.OverlayType.POLYGON;
                break;
            case 'rectangle':
                mode = drawing.OverlayType.RECTANGLE;
                break;
            case 'circle':
                mode = drawing.OverlayType.CIRCLE;
                break;
            case 'poi':
                mode = drawing.OverlayType.MARKER;
                break;
            default:
                mode = null;
        }
        drawingManager.setDrawingMode(mode);

    }, [drawingManager, activeTool, drawing]);

    // Reset POI sequence when tool changes (except when switching to 'poi' which starts new or continues?)
    // Actually, we want to start fresh if we switch TO poi? Or just keep it?
    // Let's assume switching tool resets the current drawing session.
    useEffect(() => {
        if (activeTool !== 'poi') {
            // Clear POI sequence visual if we leave the tool? 
            // Or maybe we should persist it? 
            // For now, let's clear the "drawing session" state but the overlays might remain if we don't clear them.
            // But the requirement is "until user stops".
            // If we leave 'poi', we should probably finalize the sequence.
            // For this implementation, we'll clear the internal reference to start a new sequence next time.
            poiSequence.current = { markers: [], polyline: null };
        }
    }, [activeTool]);

    // Helper to update Polyline
    const updatePolyline = () => {
        const seq = poiSequence.current;
        if (seq.polyline) {
            const newPath = seq.markers.map(m => m.getPosition()!);
            seq.polyline.setPath(newPath);
        }
    };

    // Helper to re-index markers
    const reindexMarkers = () => {
        poiSequence.current.markers.forEach((marker, index) => {
            marker.setLabel((index + 1).toString());
        });
    };

    // Handle Save POI
    const handleSavePOI = (data: POIData) => {
        if (!selectedMarker) return;

        // Update position
        const newPos = new google.maps.LatLng(data.lat, data.lng);
        selectedMarker.setPosition(newPos);

        // Update custom data
        (selectedMarker as any).customData = {
            alt: data.alt,
            speed: data.speed,
            angle: data.angle,
            heading: data.heading,
            action: data.action
        };

        // Update visuals
        updatePolyline();

        // Close window
        setSelectedMarker(null);
    };

    // Handle Delete POI
    const handleDeletePOI = () => {
        if (!selectedMarker) return;

        // Remove from map
        selectedMarker.setMap(null);

        // Remove from sequence
        const index = poiSequence.current.markers.indexOf(selectedMarker);
        if (index > -1) {
            poiSequence.current.markers.splice(index, 1);
        }

        // Re-index and update path
        reindexMarkers();
        updatePolyline();

        // Close window
        setSelectedMarker(null);
    };

    // Handle Overlay Complete
    useEffect(() => {
        if (!drawingManager || !drawing) return;

        const updateArea = (overlay: any, type: google.maps.drawing.OverlayType) => {
            if (!onAreaChange) return;

            let geoJson: any = null;

            if (type === drawing.OverlayType.POLYGON) {
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
            } else if (type === drawing.OverlayType.RECTANGLE) {
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
            } else if (type === drawing.OverlayType.CIRCLE) {
                const center = overlay.getCenter();
                const radius = overlay.getRadius();
                geoJson = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [center.lng(), center.lat()]
                    },
                    properties: {
                        type: 'circle',
                        radius: radius
                    }
                };
            } else if (type === drawing.OverlayType.MARKER) {
                // Sequential POI Logic
                const marker = overlay as google.maps.Marker;
                const currentSeq = poiSequence.current;

                if (currentSeq.markers.length >= 50) {
                    marker.setMap(null); // Remove if over limit
                    return;
                }

                // Add to sequence
                currentSeq.markers.push(marker);
                const index = currentSeq.markers.length;
                marker.setLabel(index.toString());

                // Update Polyline
                if (!currentSeq.polyline) {
                    currentSeq.polyline = new google.maps.Polyline({
                        map: map,
                        path: [],
                        strokeColor: '#0000FF', // Blue color for path
                        strokeOpacity: 1.0,
                        strokeWeight: 2,
                        icons: [{
                            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                            offset: '100%',
                            repeat: '100px' // Arrow every 100px or just at end? Screenshot shows arrows on line.
                        }]
                    });
                }

                const path = currentSeq.polyline.getPath();
                path.push(marker.getPosition()!);

                // Construct GeoJSON for the sequence (FeatureCollection?)
                // Or just emit the latest point? 
                // Usually onAreaChange expects a single Feature. 
                // We might need to wrap this as a MultiPoint or just emit the last point for now,
                // but the visual is handled by Google Maps objects.
                // Let's emit a FeatureCollection of Points.
                const features = currentSeq.markers.map((m, i) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [m.getPosition()!.lng(), m.getPosition()!.lat()]
                    },
                    properties: {
                        type: 'poi',
                        sequence: i + 1
                    }
                }));

                geoJson = {
                    type: 'FeatureCollection',
                    features: features
                };
            }

            if (geoJson) {
                onAreaChange(geoJson);
                console.log('Draw Update:', JSON.stringify(geoJson));
            }
        };

        const listener = google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
            const overlay = event.overlay;

            // Special handling for MARKER (Sequential POI)
            if (event.type === drawing.OverlayType.MARKER) {
                // Do NOT clear previous overlay
                // Do NOT reset drawing mode
                updateArea(overlay, event.type);

                // Add click listener to open InfoWindow
                google.maps.event.addListener(overlay, 'click', () => {
                    setSelectedMarker(overlay as google.maps.Marker);
                });

                // Add listener for dragend to update polyline?
                // For simplicity, we might skip drag updates for the sequence path in this iteration,
                // or we need to re-render the polyline on drag.
                google.maps.event.addListener(overlay, 'dragend', () => {
                    // Rebuild path from markers
                    const seq = poiSequence.current;
                    if (seq.polyline) {
                        const newPath = seq.markers.map(m => m.getPosition()!);
                        seq.polyline.setPath(newPath);
                    }
                    updateArea(overlay, event.type);
                });



                return;
            }

            // Clear previous overlay if exists (single shape mode for others)
            if (currentOverlay.current) {
                // @ts-ignore
                currentOverlay.current.setMap(null);
            }

            currentOverlay.current = overlay;

            // Reset to select mode
            drawingManager.setDrawingMode(null);

            updateArea(overlay, event.type);

            // Add listeners for edits
            if (event.type === drawing.OverlayType.POLYGON) {
                const path = (overlay as google.maps.Polygon).getPath();
                ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
                    google.maps.event.addListener(path, evt, () => updateArea(overlay, event.type));
                });
            } else if (event.type === drawing.OverlayType.RECTANGLE) {
                google.maps.event.addListener(overlay, 'bounds_changed', () => updateArea(overlay, event.type));
            } else if (event.type === drawing.OverlayType.CIRCLE) {
                google.maps.event.addListener(overlay, 'radius_changed', () => updateArea(overlay, event.type));
                google.maps.event.addListener(overlay, 'center_changed', () => updateArea(overlay, event.type));
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [drawingManager, onAreaChange]);

    return (
        <>
            {selectedMarker && (
                <POIInfoWindow
                    marker={selectedMarker}
                    onClose={() => setSelectedMarker(null)}
                    onSave={handleSavePOI}
                    onDelete={handleDeletePOI}
                />
            )}
        </>
    );
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
                    <MapManager
                        activeTool={activeTool}
                        onAreaChange={handleAreaChange}
                    />
                </Map>
            </APIProvider>
        </div>
    );
};
