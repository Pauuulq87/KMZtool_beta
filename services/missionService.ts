import api from './api';
import { MissionSettings } from '../types';

export interface Mission {
    id: string;
    name: string;
    settings: MissionSettings;
    waypoints: any[]; // Using any[] for now to match backend Json type, can be typed strictly
    pois: any[];
    area: any; // GeoJSON for the mission area
    updatedAt: string;
    createdAt: string;
}

export interface MissionSummary {
    id: string;
    name: string;
    updatedAt: string;
    createdAt: string;
}

export const missionService = {
    async getAll(): Promise<MissionSummary[]> {
        const response = await api.get<MissionSummary[]>('/missions');
        return response.data;
    },

    async getById(id: string): Promise<Mission> {
        const response = await api.get<Mission>(`/missions/${id}`);
        return response.data;
    },

    async create(data: Partial<Mission>): Promise<Mission> {
        const response = await api.post<Mission>('/missions', data);
        return response.data;
    },

    async update(id: string, data: Partial<Mission>): Promise<Mission> {
        const response = await api.put<Mission>(`/missions/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/missions/${id}`);
    },

    async saveMission(mission: Partial<Mission>): Promise<Mission> {
        if (mission.id) {
            return this.update(mission.id, mission);
        } else {
            return this.create(mission);
        }
    }
};
