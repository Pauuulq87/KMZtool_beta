/// <reference types="google.maps" />
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary, ControlPosition } from '@vis.gl/react-google-maps';
import { Undo, Redo, RotateCcw, Upload, Search, Hexagon, Square, MapPin, MousePointer, Navigation } from 'lucide-react';
import { POIInfoWindow, POIData } from './POIInfoWindow';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface MapContainerProps {
    activeTool: string;
    onAreaChange?: (geoJson: any) => void;
    waypoints?: any[];
    initialArea?: any;
    initialPOIs?: any[];
}

// Custom Control Components
const SearchControl = () => {
    const map = useMap();
    const places = useMapsLibrary('places');
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const sb = new places.SearchBox(inputRef.current);
        setSearchBox(sb);
    }, [places]);

    useEffect(() => {
        if (!searchBox || !map) return;

        const listener = searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (!places || places.length === 0) return;

            const bounds = new google.maps.LatLngBounds();
            places.forEach((place) => {
                if (!place.geometry || !place.geometry.location) return;

                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [searchBox, map]);

    return (
        <div className="flex-1 bg-white rounded-md shadow-md flex items-center p-1 pointer-events-auto">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
                ref={inputRef}
                type="text"
                placeholder="Search for a location"
                className="flex-1 px-3 py-1 outline-none text-sm"
            />
        </div>
    );
};

// Context for Map Controls
interface MapControlContextType {
    undo: () => void;
    redo: () => void;
    reset: () => void;
    registerHandlers: (handlers: { undo: () => void; redo: () => void; reset: () => void }) => void;
}

const MapControlContext = React.createContext<MapControlContextType>({
    undo: () => { },
    redo: () => { },
    reset: () => { },
    registerHandlers: () => { },
});

const MapControlProvider = ({ children }: { children: React.ReactNode }) => {
    const [handlers, setHandlers] = useState({ undo: () => { }, redo: () => { }, reset: () => { } });

    const registerHandlers = useCallback((newHandlers: { undo: () => void; redo: () => void; reset: () => void }) => {
        setHandlers(newHandlers);
    }, []);

    return (
        <MapControlContext.Provider value={{ ...handlers, registerHandlers }}>
            {children}
        </MapControlContext.Provider>
    );
};

const TopBar = () => {
    const { undo, redo, reset } = React.useContext(MapControlContext);

    return (
        <div className="absolute top-4 left-4 right-4 flex gap-2 z-10 pointer-events-none">
            <SearchControl />
            <div className="flex gap-2 pointer-events-auto">
                <button
                    onClick={undo}
                    className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1 active:bg-gray-100"
                >
                    <Undo className="w-4 h-4" /> Undo
                </button>
                <button
                    onClick={redo}
                    className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1 active:bg-gray-100"
                >
                    <Redo className="w-4 h-4" /> Redo
                </button>
                <button
                    onClick={reset}
                    className="bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-1 active:bg-red-100"
                >
                    <RotateCcw className="w-4 h-4" /> Reset
                </button>
            </div>
        </div>
    );
};

const InstructionOverlay = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
    if (!visible) return null;
    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm px-8 py-6 shadow-xl text-center z-10 border border-primary/10 max-w-md pointer-events-auto">
            <div className="flex justify-end">
                <button
                    onClick={onClose}
                    className="text-secondary hover:text-primary text-sm px-2 py-1"
                    aria-label="關閉提示"
                >
                    ×
                </button>
            </div>
            <h3 className="text-xl font-serif font-bold text-primary mb-2">開始繪製區域</h3>
            <p className="text-base text-secondary">
                請使用多邊形、矩形或興趣點工具。<br />
                繪製完成後請點擊 <span className="font-bold text-primary">產生路徑</span>。
            </p>
        </div>
    );
};



const MapManager = ({ activeTool, onAreaChange, waypoints, initialArea, initialPOIs }: { activeTool: string, onAreaChange?: (geoJson: any) => void, waypoints?: any[], initialArea?: any, initialPOIs?: any[] }) => {
    const map = useMap();
    const drawing = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
    const currentOverlay = useRef<any | null>(null);
    const { registerHandlers } = React.useContext(MapControlContext);

    // POI State
    const poiSequence = useRef<{ markers: google.maps.Marker[], polyline: google.maps.Polyline | null }>({ markers: [], polyline: null });
    const [selectedMarker, setSelectedMarker] = useState<google.maps.Marker | null>(null);

    // History State
    const historyStack = useRef<any[]>([]); // Stack of actions/states
    const redoStack = useRef<any[]>([]); // Stack of undone actions

    // Waypoint Visualization State
    const waypointMarkers = useRef<google.maps.Marker[]>([]);
    const waypointPolyline = useRef<google.maps.Polyline | null>(null);

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

    // Implement Undo/Redo/Reset
    useEffect(() => {
        const handleUndo = () => {
            const lastAction = historyStack.current.pop();
            if (!lastAction) return;

            redoStack.current.push(lastAction);

            if (lastAction.type === 'poi') {
                const marker = lastAction.object as google.maps.Marker;
                marker.setMap(null);

                // Remove from sequence list
                const idx = poiSequence.current.markers.indexOf(marker);
                if (idx > -1) poiSequence.current.markers.splice(idx, 1);

                updatePolyline();

                // Update App state
                const features = poiSequence.current.markers.map((m, i) => ({
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
                if (onAreaChange) onAreaChange({ type: 'FeatureCollection', features });

            } else if (lastAction.type === 'overlay') {
                const overlay = lastAction.object as any; // Cast to any to access setMap
                overlay.setMap(null);

                // Restore replaced overlay if any
                if (lastAction.replaced) {
                    const replaced = lastAction.replaced as any;
                    replaced.setMap(map);
                    currentOverlay.current = replaced;
                    if (onAreaChange) onAreaChange(lastAction.replacedGeoJson);
                } else {
                    currentOverlay.current = null;
                    if (onAreaChange) onAreaChange(null);
                }
            }
        };

        const handleRedo = () => {
            const nextAction = redoStack.current.pop();
            if (!nextAction) return;

            historyStack.current.push(nextAction);

            if (nextAction.type === 'poi') {
                const marker = nextAction.object as google.maps.Marker;
                marker.setMap(map);
                poiSequence.current.markers.push(marker);
                marker.setLabel(poiSequence.current.markers.length.toString());
                updatePolyline();

                const features = poiSequence.current.markers.map((m, i) => ({
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
                if (onAreaChange) onAreaChange({ type: 'FeatureCollection', features });

            } else if (nextAction.type === 'overlay') {
                const overlay = nextAction.object as any; // Cast to any

                // Hide replaced overlay if any
                if (nextAction.replaced) {
                    const replaced = nextAction.replaced as any;
                    replaced.setMap(null);
                }

                overlay.setMap(map);
                currentOverlay.current = overlay;

                if (nextAction.geoJson && onAreaChange) {
                    onAreaChange(nextAction.geoJson);
                }
            }
        };

        const handleReset = () => {
            // Clear POIs
            poiSequence.current.markers.forEach(m => m.setMap(null));
            poiSequence.current.markers = [];
            if (poiSequence.current.polyline) {
                poiSequence.current.polyline.setMap(null);
                poiSequence.current.polyline = null;
            }

            // Clear generated waypoint visuals
            waypointMarkers.current.forEach(m => m.setMap(null));
            waypointMarkers.current = [];
            if (waypointPolyline.current) {
                waypointPolyline.current.setMap(null);
                waypointPolyline.current = null;
            }

            // Clear Overlay
            if (currentOverlay.current) {
                // @ts-ignore
                currentOverlay.current.setMap(null);
                currentOverlay.current = null;
            }

            // Clear History
            historyStack.current = [];
            redoStack.current = [];

            // Notify App
            if (onAreaChange) onAreaChange(null);
        };

        registerHandlers({ undo: handleUndo, redo: handleRedo, reset: handleReset });
    }, [map, registerHandlers, onAreaChange]);

    // Initialize from Props (Load Mission)
    useEffect(() => {
        if (!map || !drawing || !initialArea) return;

        // Clear existing
        if (currentOverlay.current) {
            currentOverlay.current.setMap(null);
            currentOverlay.current = null;
        }

        // Render Area
        let newOverlay: google.maps.MVCObject | null = null;
        let type: google.maps.drawing.OverlayType | null = null;

        if (initialArea.geometry.type === 'Polygon') {
            const coords = initialArea.geometry.coordinates[0].map((p: any) => ({ lat: p[1], lng: p[0] }));
            // Remove last point if it's same as first (GeoJSON closes loop, Google Maps Polygon doesn't need to)
            if (coords.length > 0 && coords[0].lat === coords[coords.length - 1].lat && coords[0].lng === coords[coords.length - 1].lng) {
                coords.pop();
            }

            const polygon = new google.maps.Polygon({
                paths: coords,
                ...drawingManager?.get('polygonOptions'),
                editable: true,
                draggable: true,
                map: map
            });
            newOverlay = polygon;
            type = drawing.OverlayType.POLYGON;

        } else if (initialArea.properties && initialArea.properties.type === 'circle') {
            const center = { lat: initialArea.geometry.coordinates[1], lng: initialArea.geometry.coordinates[0] };
            const radius = initialArea.properties.radius;

            const circle = new google.maps.Circle({
                center,
                radius,
                ...drawingManager?.get('circleOptions'),
                editable: true,
                draggable: true,
                map: map
            });
            newOverlay = circle;
            type = drawing.OverlayType.CIRCLE;
        }

        if (newOverlay && type) {
            currentOverlay.current = newOverlay;

            // Re-attach listeners
            // We need to duplicate the listener logic from overlaycomplete
            // Or extract it. For now, duplicating for simplicity.
            const updateArea = (overlay: any, type: google.maps.drawing.OverlayType) => {
                // Logic duplicated from overlaycomplete
                // We can't easily access the updateArea defined in the other effect.
                // So we trigger a fake event or just manually call onAreaChange?
                // But onAreaChange updates App state, which we don't want to loop back here.
                // But since we use loadedMissionArea, it won't loop.

                // However, we need to construct the GeoJSON to send to onAreaChange.
                // Let's just trigger the same logic.
                // We can define a helper function outside effects?
                // Or just let the user edit trigger the other effect?
                // Wait, the other effect listens to `drawingManager` events.
                // We need to attach listeners to THIS specific overlay.
            };

            // Actually, we can just attach the listeners here.
            if (type === drawing.OverlayType.POLYGON) {
                const path = (newOverlay as google.maps.Polygon).getPath();
                ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
                    // We need to reconstruct GeoJSON and call onAreaChange
                    // This is getting repetitive. 
                    // Let's rely on the user interacting to trigger updates?
                    // No, if they drag, it should update.

                    // Let's define a shared update function.
                    // But we can't easily share across effects without `useCallback`.
                    // Let's just emit a "loaded" event? No.
                });
                // For now, let's just make it editable. Actual state update happens when user edits.
                // We need to ensure `onAreaChange` is called when user edits this loaded overlay.
                // The `overlaycomplete` listener only attaches to NEW overlays created by DrawingManager.
                // So we MUST attach listeners here manually.

                const triggerUpdate = () => {
                    // Construct GeoJSON
                    const poly = newOverlay as google.maps.Polygon;
                    const p = poly.getPath();
                    const c = [];
                    for (let i = 0; i < p.getLength(); i++) {
                        c.push([p.getAt(i).lng(), p.getAt(i).lat()]);
                    }
                    if (c.length > 0) c.push(c[0]);

                    const geoJson = {
                        type: 'Feature',
                        geometry: { type: 'Polygon', coordinates: [c] },
                        properties: {}
                    };
                    if (onAreaChange) onAreaChange(geoJson);
                };

                ['set_at', 'insert_at', 'remove_at'].forEach(evt => {
                    google.maps.event.addListener(path, evt, triggerUpdate);
                });
                google.maps.event.addListener(newOverlay, 'dragend', triggerUpdate);
            } else if (type === drawing.OverlayType.CIRCLE) {
                const triggerUpdate = () => {
                    const circle = newOverlay as google.maps.Circle;
                    const geoJson = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [circle.getCenter()!.lng(), circle.getCenter()!.lat()]
                        },
                        properties: {
                            type: 'circle',
                            radius: circle.getRadius()
                        }
                    };
                    if (onAreaChange) onAreaChange(geoJson);
                };
                google.maps.event.addListener(newOverlay, 'radius_changed', triggerUpdate);
                google.maps.event.addListener(newOverlay, 'center_changed', triggerUpdate);
            }
        }

    }, [initialArea, map, drawing, drawingManager, onAreaChange]);

    // Initialize POIs
    useEffect(() => {
        if (!map || !initialPOIs) return;

        // Clear existing POIs
        poiSequence.current.markers.forEach(m => m.setMap(null));
        poiSequence.current.markers = [];
        if (poiSequence.current.polyline) {
            poiSequence.current.polyline.setMap(null);
            poiSequence.current.polyline = null;
        }

        // Render new POIs
        initialPOIs.forEach((poi: any, index: number) => {
            const position = { lat: poi.geometry.coordinates[1], lng: poi.geometry.coordinates[0] };
            const marker = new google.maps.Marker({
                position,
                map: map,
                label: (index + 1).toString(),
                draggable: true // Allow dragging loaded POIs
            });

            // Attach listeners
            google.maps.event.addListener(marker, 'click', () => {
                setSelectedMarker(marker);
            });

            // Handle drag
            google.maps.event.addListener(marker, 'dragend', () => {
                // Update polyline
                const seq = poiSequence.current;
                if (seq.polyline) {
                    const newPath = seq.markers.map(m => m.getPosition()!);
                    seq.polyline.setPath(newPath);
                }
                // Emit update
                // We need to emit the whole collection
                // Construct FeatureCollection
                const features = seq.markers.map((m, i) => ({
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
                if (onAreaChange) onAreaChange({ type: 'FeatureCollection', features });
            });

            poiSequence.current.markers.push(marker);
        });

        // Create Polyline
        if (poiSequence.current.markers.length > 0) {
            poiSequence.current.polyline = new google.maps.Polyline({
                map: map,
                path: poiSequence.current.markers.map(m => m.getPosition()!),
                strokeColor: '#0000FF',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                icons: [{
                    icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                    offset: '100%',
                    repeat: '100px'
                }]
            });
        }

    }, [initialPOIs, map, onAreaChange]);

    // Wait, this is getting complicated.
    // Let's look at how `MapManager` is implemented.
    // It uses `drawingManager` to create shapes.

    // Let's just add the props and basic rendering for now.
    // I will implement `renderGeoJson` function.



    // Render Waypoints
    useEffect(() => {
        if (!map) return;

        // Clear existing
        waypointMarkers.current.forEach(m => m.setMap(null));
        waypointMarkers.current = [];
        if (waypointPolyline.current) {
            waypointPolyline.current.setMap(null);
            waypointPolyline.current = null;
        }

        if (!waypoints || waypoints.length === 0) return;

        // Create Polyline
        const path = waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));
        const polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#0000FF', // Blue
            strokeOpacity: 1.0,
            strokeWeight: 2,
            icons: [{
                icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                offset: '0',
                repeat: '50px' // Arrow every 50px
            }],
            map: map
        });
        waypointPolyline.current = polyline;

        // Create Markers
        waypoints.forEach((wp, index) => {
            const marker = new google.maps.Marker({
                position: { lat: wp.lat, lng: wp.lng },
                map: map,
                label: {
                    text: (index + 1).toString(),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#0000FF',
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 2,
                },
                title: `Waypoint ${index + 1}`
            });
            waypointMarkers.current.push(marker);
        });

    }, [map, waypoints]);

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

    // Helper to get GeoJSON from an overlay
    const getGeoJsonFromOverlay = useCallback((overlay: any, type?: google.maps.drawing.OverlayType) => {
        if (!drawing || !onAreaChange || !overlay) return null;

        let geoJson: any = null;

        // Use instanceof checks if type is not provided or to be safe
        if (overlay instanceof google.maps.Polygon) {
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
        } else if (overlay instanceof google.maps.Rectangle) {
            const bounds = overlay.getBounds();
            if (bounds) {
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
        } else if (overlay instanceof google.maps.Circle) {
            const center = overlay.getCenter();
            const radius = overlay.getRadius();
            if (center) {
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
            }
        }

        return geoJson;
    }, [drawing, onAreaChange]);

    // Handle Overlay Complete
    useEffect(() => {
        if (!drawingManager || !drawing) return;

        const updateArea = (overlay: any, type: google.maps.drawing.OverlayType) => {
            if (!onAreaChange) return;

            let geoJson: any = null;

            if (type === drawing.OverlayType.MARKER) {
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
            } else {
                geoJson = getGeoJsonFromOverlay(overlay, type);
            }

            if (geoJson) {
                onAreaChange(geoJson);
                console.log('Draw Update:', JSON.stringify(geoJson));
            }
            return geoJson;
        };

        const listener = google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
            const overlay = event.overlay;

            // Special handling for MARKER (Sequential POI)
            if (event.type === drawing.OverlayType.MARKER) {
                const geoJson = updateArea(overlay, event.type);

                // Add to History
                historyStack.current.push({
                    type: 'poi',
                    object: overlay,
                    geoJson: geoJson
                });
                redoStack.current = []; // Clear redo on new action

                // Add click listener to open InfoWindow
                google.maps.event.addListener(overlay, 'click', () => {
                    setSelectedMarker(overlay as google.maps.Marker);
                });

                // Add listener for dragend
                google.maps.event.addListener(overlay, 'dragend', () => {
                    // Rebuild path
                    const seq = poiSequence.current;
                    if (seq.polyline) {
                        const newPath = seq.markers.map(m => m.getPosition()!);
                        seq.polyline.setPath(newPath);
                    }
                    updateArea(overlay, event.type);
                });

                return;
            }

            // Clear previous overlay if exists
            let replacedOverlay = null;
            let replacedGeoJson = null;
            if (currentOverlay.current) {
                replacedOverlay = currentOverlay.current;
                // @ts-ignore
                replacedGeoJson = getGeoJsonFromOverlay(currentOverlay.current, event.type); // Assuming type is same or we need to infer
                // @ts-ignore
                currentOverlay.current.setMap(null);
            }

            currentOverlay.current = overlay;
            drawingManager.setDrawingMode(null);

            const geoJson = updateArea(overlay, event.type);

            // Add to History
            historyStack.current.push({
                type: 'overlay',
                object: overlay,
                geoJson: geoJson,
                replaced: replacedOverlay,
                replacedGeoJson: replacedGeoJson
            });
            redoStack.current = [];

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

export const MapContainer: React.FC<MapContainerProps> = ({ activeTool, onAreaChange, waypoints, initialArea, initialPOIs }) => {
    const [showInstruction, setShowInstruction] = useState(true);

    const handleAreaChange = useCallback((geoJson: any) => {
        if (geoJson) {
            setShowInstruction(false);
        } else {
            setShowInstruction(true);
        }
        if (onAreaChange) {
            onAreaChange(geoJson);
        }
    }, [onAreaChange]);

    return (
        <div className="relative w-full h-full">
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <MapControlProvider>
                    <TopBar />
                    <InstructionOverlay visible={showInstruction} onClose={() => setShowInstruction(false)} />
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
                            waypoints={waypoints}
                            initialArea={initialArea}
                            initialPOIs={initialPOIs}
                        />
                    </Map>
                </MapControlProvider>
            </APIProvider>
        </div>
    );
};
