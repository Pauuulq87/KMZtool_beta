import express from 'express';
import {
    createMission,
    getMissions,
    getMissionById,
    updateMission,
    deleteMission,
} from '../controllers/missionController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/', createMission);
router.get('/', getMissions);
router.get('/:id', getMissionById);
router.put('/:id', updateMission);
router.delete('/:id', deleteMission);

export default router;
