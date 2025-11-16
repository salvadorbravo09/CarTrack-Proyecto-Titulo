import { Router } from 'express';
import { TransferController } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post('/', TransferController.initiateTransfer);

router.get('/sent', TransferController.getSentTransfers);

router.get('/received', TransferController.getReceivedTransfers);

router.post('/check-expired', requireRole('ADMIN'), TransferController.checkExpiredTransfers);
router.get('/:transferCode', TransferController.getTransferByCode);

router.post('/:transferCode/accept', TransferController.acceptTransfer);

router.post('/:transferCode/reject', TransferController.rejectTransfer);

router.delete('/:transferId', TransferController.cancelTransfer);

export default router;
