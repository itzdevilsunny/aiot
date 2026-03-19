import { Router } from 'express';
import { getOverviewStats, getAnomalyTrends } from '../controllers/statsController';

const router = Router();

router.get('/overview', getOverviewStats);
router.get('/anomaly-trends', getAnomalyTrends);

export default router;
