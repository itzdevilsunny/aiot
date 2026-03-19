import { Router } from 'express';
import { generateDailyReport } from '../controllers/reportController';

const router = Router();

router.get('/daily', generateDailyReport);

export default router;
