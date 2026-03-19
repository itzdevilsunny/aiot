import { Router } from 'express';
import { getEdgeNodes, sendEdgeCommand, updateHeartbeat } from '../controllers/edgeController';

const router = Router();

router.get('/', getEdgeNodes);
router.post('/heartbeat', updateHeartbeat);
router.post('/:id/command', sendEdgeCommand);

export default router;
