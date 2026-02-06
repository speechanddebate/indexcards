import { Router } from 'express';
import * as controller from '../../../../controllers/rest/adController.js';
import { requireSiteAdmin } from '../../../../middleware/authorization/authorization.js';

const router = Router();

// Access through /rest/ads

router.get('/', requireSiteAdmin, controller.getAds);
router.get('/published', controller.getPublishedAds);

export default router;