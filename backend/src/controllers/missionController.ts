import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create a new mission
export const createMission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { name, settings, waypoints, pois } = req.body;

        if (!name) {
            res.status(400).json({ error: 'Mission name is required' });
            return;
        }

        const mission = await prisma.mission.create({
            data: {
                name,
                settings: settings || {},
                waypoints: waypoints || [],
                pois: pois || [],
                userId: req.user.id,
            },
        });

        res.status(201).json(mission);
    } catch (error) {
        console.error('Create mission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all missions for the current user
export const getMissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const missions = await prisma.mission.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                name: true,
                updatedAt: true,
                createdAt: true,
                // We don't fetch heavy JSON data for the list view
            },
        });

        res.json(missions);
    } catch (error) {
        console.error('Get missions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get a specific mission by ID
export const getMissionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const mission = await prisma.mission.findUnique({
            where: { id },
        });

        if (!mission) {
            res.status(404).json({ error: 'Mission not found' });
            return;
        }

        // Ensure the mission belongs to the user
        if (mission.userId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        res.json(mission);
    } catch (error) {
        console.error('Get mission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update a mission
export const updateMission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { id } = req.params;
        const { name, settings, waypoints, pois } = req.body;

        // Check if mission exists and belongs to user
        const existingMission = await prisma.mission.findUnique({
            where: { id },
        });

        if (!existingMission) {
            res.status(404).json({ error: 'Mission not found' });
            return;
        }

        if (existingMission.userId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const updatedMission = await prisma.mission.update({
            where: { id },
            data: {
                name: name || undefined,
                settings: settings || undefined,
                waypoints: waypoints || undefined,
                pois: pois || undefined,
            },
        });

        res.json(updatedMission);
    } catch (error) {
        console.error('Update mission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a mission
export const deleteMission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        // Check if mission exists and belongs to user
        const existingMission = await prisma.mission.findUnique({
            where: { id },
        });

        if (!existingMission) {
            res.status(404).json({ error: 'Mission not found' });
            return;
        }

        if (existingMission.userId !== req.user.id) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        await prisma.mission.delete({
            where: { id },
        });

        res.json({ message: 'Mission deleted successfully' });
    } catch (error) {
        console.error('Delete mission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
