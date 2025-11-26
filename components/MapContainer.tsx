import React, { useCallback, useRef, useEffect } from 'react';
import Map, { NavigationControl, ScaleControl } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl';
import type { MapRef, ControlPosition } from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// Default to a placeholder token if not provided. 
// Note: Map tiles will not load without a valid token, but functionality remains.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY2w4Z3...”';

interface DrawControlProps {
    position?: ControlPosition;
    onCreate: (evt: any) => void;
    onUpdate: (evt: any) => void;
    onDelete: (evt: any) => void;
}

// Custom Draw Control Wrapper
function DrawControl(props: DrawControlProps) {
    useControl<MapboxDraw>(
        () => new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true
            },
            defaultMode: 'draw_polygon'
        }),
        ({ map }) => {
            map.on('draw.create', props.onCreate);
            map.on('draw.update', props.onUpdate);
            map.on('draw.delete', props.onDelete);
        },
        ({ map }) => {
            map.off('draw.create', props.onCreate);
            map.off('draw.update', props.onUpdate);
            map.off('draw.delete', props.onDelete);
        },
        {
            position: props.position
        }
    );

    return null;
}

interface MapContainerProps {
    onAreaChange?: (geoJson: any) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({ onAreaChange }) => {
    const mapRef = useRef<MapRef>(null);

    const onUpdate = useCallback((e: any) => {
        // Extract the features from the event or the draw instance
        // We want the raw coordinates for high precision (WGS84)
        const data = e.features[0];
        if (onAreaChange) {
            onAreaChange(data);
        }
        console.log('Draw Update (High Precision):', JSON.stringify(data.geometry.coordinates));
    }, [onAreaChange]);

    const onDelete = useCallback((e: any) => {
        if (onAreaChange) {
            onAreaChange(null);
        }
    }, [onAreaChange]);

    return (
        <Map
            ref={mapRef}
            initialViewState={{
                longitude: 121.5,
                latitude: 25.0,
                zoom: 10
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            attributionControl={true}
        >
            <NavigationControl position="top-right" />
            <ScaleControl position="bottom-right" />

            <DrawControl
                position="top-left"
                onCreate={onUpdate}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        </Map>
    );
};
