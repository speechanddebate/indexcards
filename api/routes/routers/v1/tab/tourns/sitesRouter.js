import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import controller from '../../../../../controllers/tab/siteController.js';

const router = Router({ mergeParams: true });

router.route('/')
    .get( requireAccess('tourn', 'read'),  controller.getSites)
    .post(requireAccess('tourn', 'write'), controller.createSite);

router.route('/:siteId')
    .get(   requireAccess('tourn', 'read'),  controller.getSite)
    .put(   requireAccess('tourn', 'write'), controller.updateSite)
    .delete(requireAccess('tourn', 'write'), controller.deleteSite);

router.route('/:siteId/rooms')
    .get( requireAccess('tourn', 'read'),  controller.getRooms)
    .post(requireAccess('tourn', 'write'), controller.createRoom);

router.route('/:siteId/rooms/:roomId')
    .get(   requireAccess('tourn', 'read'),  controller.getRoom)
    .put(   requireAccess('tourn', 'write'), controller.updateRoom)
    .delete(requireAccess('tourn', 'write'), controller.deleteRoom);

export default router;