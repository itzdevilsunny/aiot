import { Router } from 'express';
import { getStorageStats, getStorageFiles, deleteStorageFile, updateRetentionPolicy } from '../controllers/storageController';

const router = Router();

router.get('/stats', getStorageStats);
router.get('/files', getStorageFiles);
router.delete('/files', deleteStorageFile);
router.put('/policy', updateRetentionPolicy);

export default router;
