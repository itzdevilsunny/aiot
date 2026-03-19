import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = Router();

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);      // must come before :id
router.put('/:id/read', markAsRead);

export default router;
