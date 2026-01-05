import { Router } from 'express';
import * as controller from '../../../../controllers/ext/nsdaController.js';

const router = Router();

router.get('/history', controller.getPersonHistory);
router
  .route('/payment')
  .get(controller.getPayment)
  .post(controller.postPayment);

router
  .route('/payment/tourn/:tournId')
  .get(controller.getPayment)
  .post(controller.postPayment);
router.get('/nats/appearances', controller.syncNatsAppearances);
router.get('/nats/placements', controller.natsIndividualHonors);

export default router;
