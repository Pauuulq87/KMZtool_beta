import { describe, expect, it } from 'vitest';
import { generateRectanglePath } from '../utils/flightPathUtils';
import { MissionSettings } from '../types';

// 基礎設定：提供穩定參數以驗證掃描線生成行為
const baseSettings: MissionSettings = {
  altitude: 50,
  speed: 6,
  gimbalAngle: -90,
  pathDistance: 20,
  orientation: '南北向',
  overlap: 80,
  rotationAngle: 0,
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
};

describe('generateRectanglePath', () => {
  // 測試：南北向掃描應沿同一經度成對產生路徑點
  it('南北向掃描產生成對經度與高度速度設定', () => {
    const bounds = { north: 25.0005, south: 25.0, east: 121.001, west: 121.0 };
    const waypoints = generateRectanglePath(bounds, baseSettings);

    expect(waypoints.length).toBeGreaterThan(0);
    expect(waypoints.every((wp) => wp.alt === baseSettings.altitude)).toBe(true);
    expect(waypoints.every((wp) => wp.speed === baseSettings.speed)).toBe(true);

    const firstPairLngDiff = Math.abs(waypoints[0].lng - waypoints[1].lng);
    expect(firstPairLngDiff).toBeLessThan(1e-6);
  });

  // 測試：改為東西向時，掃描線應沿緯度展開且數量因 spacing 改變而增加
  it('東西向掃描會以緯度為主產生更多掃描線', () => {
    const bounds = { north: 25.001, south: 25.0, east: 121.002, west: 121.0 };
    const eastWestSettings: MissionSettings = { ...baseSettings, orientation: '東西向', pathDistance: 10 };
    const waypoints = generateRectanglePath(bounds, eastWestSettings);

    const uniqueLatCount = new Set(waypoints.map((wp) => wp.lat.toFixed(6))).size;
    const uniqueLngCount = new Set(waypoints.map((wp) => wp.lng.toFixed(6))).size;

    expect(uniqueLatCount).toBeGreaterThan(1);
    expect(uniqueLngCount).toBe(2); // 每條掃描線僅頭尾兩個點
  });
});
