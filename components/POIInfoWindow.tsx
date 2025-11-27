import React, { useState, useEffect } from 'react';
import { InfoWindow } from '@vis.gl/react-google-maps';

interface POIInfoWindowProps {
    marker: google.maps.Marker;
    onClose: () => void;
    onSave: (data: POIData) => void;
    onDelete: () => void;
}

export interface POIData {
    lat: number;
    lng: number;
    alt: number;
    speed: number;
    angle: number; // Gimbal Pitch
    heading: number; // Aircraft Heading
    action: string;
}

export const POIInfoWindow: React.FC<POIInfoWindowProps> = ({ marker, onClose, onSave, onDelete }) => {
    const [data, setData] = useState<POIData>({
        lat: 0,
        lng: 0,
        alt: 60,
        speed: 5.0,
        angle: -90,
        heading: 0,
        action: 'none'
    });

    useEffect(() => {
        if (marker) {
            const pos = marker.getPosition();
            // Try to get stored data from marker if available (we might need to store it in marker object or separate map)
            // For now, init with current position and defaults
            // In a real app, we'd probably attach metadata to the marker or look it up by ID
            // Let's assume for now we just read position.
            // If we want to persist other fields, we need to store them. 
            // Let's assume the parent passes data or we store it on the marker instance as 'customData'
            const customData = (marker as any).customData || {};

            setData({
                lat: pos?.lat() || 0,
                lng: pos?.lng() || 0,
                alt: customData.alt || 60,
                speed: customData.speed || 5.0,
                angle: customData.angle || -90,
                heading: customData.heading || 0,
                action: customData.action || 'none'
            });
        }
    }, [marker]);

    const handleChange = (field: keyof POIData, value: string | number) => {
        setData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        onSave(data);
    };

    return (
        <InfoWindow
            anchor={marker}
            onCloseClick={onClose}
            headerContent={<div className="font-bold text-sm">編輯興趣點</div>}
        >
            <div className="p-2 min-w-[300px] flex flex-col gap-2 text-sm">
                {/* Lat/Lng Row */}
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1">
                        <label className="w-8 text-gray-500">緯度</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={data.lat}
                            onChange={(e) => handleChange('lat', parseFloat(e.target.value))}
                            className="flex-1 border border-gray-300 rounded px-1 py-0.5"
                        />
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                        <label className="w-8 text-gray-500">經度</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={data.lng}
                            onChange={(e) => handleChange('lng', parseFloat(e.target.value))}
                            className="flex-1 border border-gray-300 rounded px-1 py-0.5"
                        />
                    </div>
                </div>

                {/* Alt/Speed Row */}
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1">
                        <label className="w-8 text-gray-500">高度</label>
                        <div className="flex-1 flex items-center border border-gray-300 rounded overflow-hidden">
                            <input
                                type="number"
                                value={data.alt}
                                onChange={(e) => handleChange('alt', parseFloat(e.target.value))}
                                className="w-full px-1 py-0.5 outline-none"
                            />
                            <span className="bg-gray-100 px-1 text-xs text-gray-500 border-l">m</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                        <label className="w-8 text-gray-500">速度</label>
                        <div className="flex-1 flex items-center border border-gray-300 rounded overflow-hidden">
                            <input
                                type="number"
                                value={data.speed}
                                onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                                className="w-full px-1 py-0.5 outline-none"
                            />
                            <span className="bg-gray-100 px-1 text-xs text-gray-500 border-l">m/s</span>
                        </div>
                    </div>
                </div>

                {/* Angle/Heading Row */}
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1">
                        <label className="w-8 text-gray-500">雲台</label>
                        <div className="flex-1 flex items-center border border-gray-300 rounded overflow-hidden">
                            <input
                                type="number"
                                value={data.angle}
                                onChange={(e) => handleChange('angle', parseFloat(e.target.value))}
                                className="w-full px-1 py-0.5 outline-none"
                            />
                            <span className="bg-gray-100 px-1 text-xs text-gray-500 border-l">deg</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                        <label className="w-8 text-gray-500">朝向</label>
                        <div className="flex-1 flex items-center border border-gray-300 rounded overflow-hidden">
                            <input
                                type="number"
                                value={data.heading}
                                onChange={(e) => handleChange('heading', parseFloat(e.target.value))}
                                className="w-full px-1 py-0.5 outline-none"
                            />
                            <span className="bg-gray-100 px-1 text-xs text-gray-500 border-l">deg</span>
                        </div>
                    </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center gap-1">
                    <select
                        value={data.action}
                        onChange={(e) => handleChange('action', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="none">無動作 (No Action)</option>
                        <option value="hover">懸停 (Hover)</option>
                        <option value="photo">拍照 (Take Photo)</option>
                        <option value="video_start">開始錄影 (Start Video)</option>
                        <option value="video_stop">停止錄影 (Stop Video)</option>
                    </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleSave}
                        className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                    >
                        儲存
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-4 py-1 border border-red-500 text-red-500 rounded hover:bg-red-50 text-sm font-medium"
                    >
                        刪除
                    </button>
                </div>
            </div>
        </InfoWindow>
    );
};
