import { Router } from 'express';
import { getAlerts, updateAlert, createAlert } from '../controllers/alertController';

const router = Router();

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);

export default router;
