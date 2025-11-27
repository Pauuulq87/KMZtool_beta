/// <reference types="google.maps" />
import { MissionSettings } from '../types';

interface Point {
    lat: number;
    lng: number;
}

interface Waypoint extends Point {
    id: string;
    sequence: number;
    action?: string;
    alt?: number;
    speed?: number;
    heading?: number;
    gimbalAngle?: number;
}

type PolygonCoords = number[][]; // [lng, lat][]

/**
 * Calculates the distance between two points in meters using the Haversine formula.
 */
function getDistance(p1: Point, p2: Point): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * 旋轉點位（近似平面座標運算，適合小範圍航線）。
 */
const rotatePoint = (point: Point, angleDeg: number, center: Point): Point => {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = point.lng - center.lng;
    const dy = point.lat - center.lat;

    return {
        lng: center.lng + dx * cos - dy * sin,
        lat: center.lat + dx * sin + dy * cos,
    };
};

/**
 * 取得多邊形的中心（簡單平均法）。
 */
const getCenter = (coords: Point[]): Point => {
    if (!coords || coords.length === 0) return { lat: 0, lng: 0 };
    const sum = coords.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
    return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
};

/**
 * 取得可用的路徑間距上限（公尺），以最窄邊界為限制並考慮旋轉角度。
 */
export const getAvailableSpacingMeters = (
    polygonCoords: PolygonCoords | undefined,
    rotationAngle: number,
    orientation: string,
): number | null => {
    if (!polygonCoords || polygonCoords.length === 0) return null;

    const polygonPoints: Point[] = polygonCoords.map(([lng, lat]) => ({ lat, lng }));
    const center = getCenter(polygonPoints);
    const rotatedPolygon = polygonPoints.map(p => rotatePoint(p, -rotationAngle, center));

    const rotatedBounds = rotatedPolygon.reduce(
        (acc, p) => ({
            north: Math.max(acc.north, p.lat),
            south: Math.min(acc.south, p.lat),
            east: Math.max(acc.east, p.lng),
            west: Math.min(acc.west, p.lng),
        }),
        { north: -90, south: 90, east: -180, west: 180 }
    );

    const centerLat = center.lat;
    const eastWestMeters = (rotatedBounds.east - rotatedBounds.west) * 111111 * Math.cos(centerLat * Math.PI / 180);
    const northSouthMeters = (rotatedBounds.north - rotatedBounds.south) * 111111;

    // 依掃描線方向取對應寬度，確保起始線貼邊且間距上限符合該方向跨度
    const meters = orientation === '南北向' ? eastWestMeters : northSouthMeters;
    return Math.max(0, Math.abs(meters));
};

/**
 * Generates a lawnmower scan pattern within a bounding box, optionally clipped by polygon and rotated by angle.
 * @param bounds The bounding box of the area (NorthEast and SouthWest).
 * @param settings Mission settings (overlap, altitude, etc.).
 * @param polygonCoords Optional polygon座標，用於裁剪路徑在繪製區域內。
 * @returns Array of waypoints.
 */
export const generateRectanglePath = (
    bounds: google.maps.LatLngBoundsLiteral,
    settings: MissionSettings,
    polygonCoords?: PolygonCoords
): Waypoint[] => {
    const waypoints: Waypoint[] = [];

    // 準備多邊形座標（若未提供則以 bounds 建立矩形）
    const polygonPoints: Point[] = polygonCoords && polygonCoords.length > 0
        ? polygonCoords.map(([lng, lat]) => ({ lat, lng }))
        : [
            { lat: bounds.north, lng: bounds.west },
            { lat: bounds.north, lng: bounds.east },
            { lat: bounds.south, lng: bounds.east },
            { lat: bounds.south, lng: bounds.west },
            { lat: bounds.north, lng: bounds.west },
        ];

    const center = getCenter(polygonPoints);
    const angle = settings.rotationAngle || 0;

    // 旋轉多邊形至新座標系，生成掃描線，再將結果旋回
    const rotatedPolygon = polygonPoints.map(p => rotatePoint(p, -angle, center));

    const rotatedBounds = rotatedPolygon.reduce(
        (acc, p) => ({
            north: Math.max(acc.north, p.lat),
            south: Math.min(acc.south, p.lat),
            east: Math.max(acc.east, p.lng),
            west: Math.min(acc.west, p.lng),
        }),
        { north: -90, south: 90, east: -180, west: 180 }
    );

    const north = rotatedBounds.north;
    const south = rotatedBounds.south;
    const east = rotatedBounds.east;
    const west = rotatedBounds.west;

    // 路徑間距：以使用者設定為主，同時限制不得超過最窄邊界
    const availableSpacing = getAvailableSpacingMeters(polygonCoords, angle, settings.orientation) ?? settings.pathDistance;
    const widthConstraint = Math.max(availableSpacing, 0.5);
    const overlapRatio = Math.max(0, Math.min(0.95, (settings.overlap ?? 0) / 100));
    let spacing = settings.pathDistance || (widthConstraint * (1 - overlapRatio));
    spacing = Math.min(spacing, widthConstraint);
    spacing = Math.max(spacing, 0.5);

    // Convert spacing to degrees (approximate)
    // 1 degree lat ~= 111111 meters
    // 1 degree lng ~= 111111 * cos(lat) meters
    const latSpacing = spacing / 111111;
    const centerLat = (north + south) / 2;
    const lngSpacing = spacing / (111111 * Math.cos(centerLat * Math.PI / 180));

    // Orientation: '南北向' (North-South) or '東西向' (East-West)
    // Note: In PropertiesPanel, '南北向' value maps to '東西向' logic? 
    // Let's check PropertiesPanel: 
    // <option value="南北向">東西向 (0°)</option> -> Label says East-West, Value says North-South?
    // <option value="東西向">南北向 (90°)</option> -> Label says North-South, Value says East-West?
    // This is confusing. Let's assume the VALUE is the source of truth for direction of lines.
    // If value is '南北向', we want lines running North-South.
    // If value is '東西向', we want lines running East-West.

    const isNorthSouth = settings.orientation === '南北向';

    // 辅助：垂直線與多邊形的交點切片
    const clipVertical = (lng: number) => {
        if (!rotatedPolygon || rotatedPolygon.length < 2) return [{ start: south, end: north }];
        const intersects: number[] = [];

        for (let i = 0; i < rotatedPolygon.length - 1; i++) {
            const { lng: x1, lat: y1 } = rotatedPolygon[i];
            const { lng: x2, lat: y2 } = rotatedPolygon[i + 1];
            // 忽略水平線
            if (x1 === x2) {
                if (x1 === lng) {
                    intersects.push(y1, y2);
                }
                continue;
            }
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            if (lng >= minX && lng <= maxX) {
                const t = (lng - x1) / (x2 - x1);
                const y = y1 + t * (y2 - y1);
                intersects.push(y);
            }
        }

        intersects.sort((a, b) => a - b);
        const segments: { start: number; end: number }[] = [];
        for (let i = 0; i < intersects.length; i += 2) {
            const start = Math.max(south, intersects[i]);
            const end = Math.min(north, intersects[i + 1] ?? north);
            if (start < end) segments.push({ start, end });
        }
        return segments;
    };

    // 輔助：水平線與多邊形的交點切片
    const clipHorizontal = (lat: number) => {
        if (!rotatedPolygon || rotatedPolygon.length < 2) return [{ start: west, end: east }];
        const intersects: number[] = [];

        for (let i = 0; i < rotatedPolygon.length - 1; i++) {
            const { lng: x1, lat: y1 } = rotatedPolygon[i];
            const { lng: x2, lat: y2 } = rotatedPolygon[i + 1];
            if (y1 === y2) {
                if (y1 === lat) {
                    intersects.push(x1, x2);
                }
                continue;
            }
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            if (lat >= minY && lat <= maxY) {
                const t = (lat - y1) / (y2 - y1);
                const x = x1 + t * (x2 - x1);
                intersects.push(x);
            }
        }

        intersects.sort((a, b) => a - b);
        const segments: { start: number; end: number }[] = [];
        for (let i = 0; i < intersects.length; i += 2) {
            const start = Math.max(west, intersects[i]);
            const end = Math.min(east, intersects[i + 1] ?? east);
            if (start < end) segments.push({ start, end });
        }
        return segments;
    };

    if (isNorthSouth) {
        // 以使用者第一個頂點為起始線（通過該頂點），再向左右展開，確保節點 1-2 可貼在首次點擊的邊上
        const startLng = rotatedPolygon[0]?.lng ?? west;
        const linePositions: number[] = [startLng];

        let offset = lngSpacing;
        while (startLng - offset >= west - 1e-12) {
            linePositions.unshift(startLng - offset);
            offset += lngSpacing;
        }
        offset = lngSpacing;
        while (startLng + offset <= east + 1e-12) {
            linePositions.push(startLng + offset);
            offset += lngSpacing;
        }

        let direction = 1; // 1 for South-to-North, -1 for North-to-South
        let seq = 1;

        linePositions.forEach((lngPos) => {
            const segments = clipVertical(lngPos);

            segments.forEach(({ start, end }) => {
                const p1 = { lat: start, lng: lngPos };
                const p2 = { lat: end, lng: lngPos };

                if (direction === 1) {
                    waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                    waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                } else {
                    waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                    waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                }
            });

            direction *= -1;
        });
    } else {
        // 東西向掃描：以使用者第一個頂點為起始線（通過該頂點），再向上下展開
        const startLat = rotatedPolygon[0]?.lat ?? south;
        const linePositions: number[] = [startLat];

        let offset = latSpacing;
        while (startLat - offset >= south - 1e-12) {
            linePositions.unshift(startLat - offset);
            offset += latSpacing;
        }
        offset = latSpacing;
        while (startLat + offset <= north + 1e-12) {
            linePositions.push(startLat + offset);
            offset += latSpacing;
        }

        let direction = 1; // 1 for West-to-East, -1 for East-to-West
        let seq = 1;

        linePositions.forEach((latPos) => {
            const segments = clipHorizontal(latPos);

            segments.forEach(({ start, end }) => {
                const p1 = { lat: latPos, lng: start };
                const p2 = { lat: latPos, lng: end };

                if (direction === 1) {
                    waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                    waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                } else {
                    waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                    waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                }
            });

            direction *= -1;
        });
    }

    // 將座標旋回原始坐標系
    return waypoints.map(wp => {
        const rotatedBack = rotatePoint({ lat: wp.lat, lng: wp.lng }, angle, center);
        return { ...wp, lat: rotatedBack.lat, lng: rotatedBack.lng };
    });
};

/**
 * 產出 KML 文字內容，支援附加任務完成方式與分段資訊（用於分割下載）。
 * 真正 KMZ 需再以 zip 壓縮，這裡先回傳 KML 字串供呼叫端下載或進一步處理。
 */
export const generateKML = (
    waypoints: Waypoint[],
    missionName: string,
    options: {
        onCompletion?: string;
        segmentIndex?: number;
        totalSegments?: number;
    } = {}
): string => {
    const { onCompletion, segmentIndex, totalSegments } = options;
    const metaData = [
        onCompletion ? `<Data name="onCompletion"><value>${onCompletion}</value></Data>` : null,
        segmentIndex ? `<Data name="segment"><value>${segmentIndex}/${totalSegments || segmentIndex}</value></Data>` : null,
    ].filter(Boolean).join('\n        ');

    const documentMeta = metaData
        ? `
    <ExtendedData>
        ${metaData}
    </ExtendedData>`
        : '';

    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${missionName}</name>
    ${documentMeta}
    <Folder>
      <name>Waypoints</name>
`;

    const kmlFooter = `    </Folder>
  </Document>
</kml>`;

    const placemarks = waypoints.map(wp => `      <Placemark>
        <name>${wp.sequence}</name>
        <Point>
          <coordinates>${wp.lng},${wp.lat},${wp.alt}</coordinates>
        </Point>
        <ExtendedData>
            <Data name="altitude"><value>${wp.alt}</value></Data>
            <Data name="speed"><value>${wp.speed}</value></Data>
            <Data name="action"><value>${wp.action || 'none'}</value></Data>
        </ExtendedData>
      </Placemark>`).join('\n');

    return kmlHeader + placemarks + '\n' + kmlFooter;
};
