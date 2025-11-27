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
 * Generates a lawnmower scan pattern within a bounding box.
 * @param bounds The bounding box of the area (NorthEast and SouthWest).
 * @param settings Mission settings (overlap, altitude, etc.).
 * @returns Array of waypoints.
 */
export const generateRectanglePath = (
    bounds: google.maps.LatLngBoundsLiteral,
    settings: MissionSettings
): Waypoint[] => {
    const waypoints: Waypoint[] = [];

    // Extract bounds
    const north = bounds.north;
    const south = bounds.south;
    const east = bounds.east;
    const west = bounds.west;

    // Calculate spacing based on overlap and altitude (simplified)
    // Assuming a standard FOV (e.g., 84 degrees) and 4:3 aspect ratio
    // Footprint Width (W) = 2 * Altitude * tan(FOV_H / 2)
    // Spacing = W * (1 - Overlap)
    // For simplicity, we can use the `pathDistance` from settings if provided, or calculate it.
    // If pathDistance is provided in settings (it is in the interface), use it.

    let spacing = settings.pathDistance || 20; // Default 20m if not set

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

    if (isNorthSouth) {
        // Lines run North-South, so we step along Longitude (East-West)
        let currentLng = west + lngSpacing / 2; // Start half spacing in
        let direction = 1; // 1 for South-to-North, -1 for North-to-South
        let seq = 1;

        while (currentLng < east) {
            const p1 = { lat: south, lng: currentLng };
            const p2 = { lat: north, lng: currentLng };

            if (direction === 1) {
                waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
            } else {
                waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
            }

            currentLng += lngSpacing;
            direction *= -1;
        }
    } else {
        // Lines run East-West, so we step along Latitude (North-South)
        let currentLat = south + latSpacing / 2;
        let direction = 1; // 1 for West-to-East, -1 for East-to-West
        let seq = 1;

        while (currentLat < north) {
            const p1 = { lat: currentLat, lng: west };
            const p2 = { lat: currentLat, lng: east };

            if (direction === 1) {
                waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
            } else {
                waypoints.push({ ...p2, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
                waypoints.push({ ...p1, id: `wp-${seq}`, sequence: seq++, alt: settings.altitude, speed: settings.speed });
            }

            currentLat += latSpacing;
            direction *= -1;
        }
    }

    return waypoints;
};

/**
 * Generates KMZ content (KML string) from mission data.
 * Note: Real KMZ is a zipped KML. This function returns the KML string.
 * The caller should zip it if needed, or we can just save as .kml for simplicity if KMZ is too complex without a zip lib.
 * But the requirement says .KMZ. We might need `jszip`.
 * For now, let's generate the KML content.
 */
export const generateKML = (
    waypoints: Waypoint[],
    missionName: string
): string => {
    const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${missionName}</name>
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
