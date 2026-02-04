import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization.js';
import controller from '../../../../../controllers/tab/siteController.js';

const router = Router({ mergeParams: true });

router.route('/')
    .get( requireAccess('tourn', 'read'),  controller.getSites)
    .post(requireAccess('tourn', 'write'), controller.createSite);

router.route('/:siteId')
    .get(   requireAccess('site', 'read'),  controller.getSite)
    .put(   requireAccess('site', 'write'), controller.updateSite)
    .delete(requireAccess('site', 'write'), controller.deleteSite);

router.route('/:siteId/rooms')
    .get( requireAccess('site', 'read'),  controller.getRooms)
    .post(requireAccess('site', 'write'), controller.createRoom);

router.route('/:siteId/rooms/:roomId')
    .get(   requireAccess('room', 'read'),  controller.getRoom)
    .put(   requireAccess('room', 'write'), controller.updateRoom)
    .delete(requireAccess('room', 'write'), controller.deleteRoom);

export default router;