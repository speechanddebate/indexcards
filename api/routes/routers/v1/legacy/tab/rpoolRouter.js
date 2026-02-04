import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization.js';
import * as controller from '../../../../../controllers/tab/rpool/index.js';

const router = Router();

router.route('/:rpoolId')
    .get(requireAccess('rpool', 'read'), controller.getRPool)
    .post(requireAccess('rpool', 'write'), controller.createRPool)
    .delete(requireAccess('rpool', 'write'), controller.deleteRPool);

router.route('/:rpoolId/rooms/:roomId')
    .post(requireAccess('rpool', 'write'), controller.createRPoolRoom)
    .delete(requireAccess('rpool', 'write'), controller.deleteRPoolRoom);

router.route('/:rpoolId/rooms')
    .get(requireAccess('rpool', 'read'), controller.getRPoolRooms)
    .post(requireAccess('rpool', 'write'), controller.createRPoolRooms)
    .delete(requireAccess('rpool', 'write'), controller.deleteRPoolRooms);

router.route('/:rpoolId/rounds/:roundId')

    .post(requireAccess('rpool', 'write'), controller.createRPoolRound)
    .delete(requireAccess('rpool', 'write'), controller.deleteRPoolRound);

router.route('/:rpoolId/rounds')
    .get(requireAccess('rpool', 'read'), controller.getRPoolRounds)
    .post(requireAccess('rpool', 'write'), controller.createRPoolRounds)
    .delete(requireAccess('rpool', 'write'), controller.deleteRPoolRounds);

export default router;
