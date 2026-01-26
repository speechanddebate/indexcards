import { Router } from 'express';
import controller from '../../../../../controllers/tab/siteController.js';

const router = Router({ mergeParams: true });

router.route('/')
    .get(controller.getSites)
    .post(controller.createSite);

router.route('/:siteId')
    .get(controller.getSite)
    .put(controller.updateSite)
    .delete(controller.deleteSite);

router.route('/:siteId/rooms')
    .get(controller.getRooms)
    .post(controller.createRoom);

router.route('/:siteId/rooms/:roomId')
    .get(controller.getRoom)
    .put(controller.updateRoom)
    .delete(controller.deleteRoom);

export default router;