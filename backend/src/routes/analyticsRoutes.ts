import { Router } from 'express';
import { getAnalytics, exportAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/', getAnalytics);
router.get('/export', exportAnalytics);

export default router;
