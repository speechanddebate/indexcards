import { Router } from 'express';
import * as controller from '../../../../../controllers/tab/rpool/index.js';

const router = Router();

router.route('/:rpoolId')
    .get(controller.getRPool)
    .post(controller.createRPool)
    .delete(controller.deleteRPool);

router.route('/:rpoolId/rooms/:roomId')
    .post(controller.createRPoolRoom)
    .delete(controller.deleteRPoolRoom);

router.route('/:rpoolId/rooms')
    .get(controller.getRPoolRooms)
    .post(controller.createRPoolRooms)
    .delete(controller.deleteRPoolRooms);

router.route('/:rpoolId/rounds/:roundId')

    .post(controller.createRPoolRound)
    .delete(controller.deleteRPoolRound);

router.route('/rpoolId/rounds')
    .get(controller.getRPoolRounds)
    .post(controller.createRPoolRounds)
    .delete(controller.deleteRPoolRounds);

export default router;
