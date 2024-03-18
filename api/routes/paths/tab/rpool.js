import {
	updateRPool,
	updateRPoolRoom,
	updateRPoolRound,
	updateRPoolRooms,
	updateRPoolRounds,
} from '../../../controllers/tab/rpool/index.js';

export default [
	{ path : '/tab/{tournId}/rpool/{rpoolId}'                 , module : updateRPool }       ,
	{ path : '/tab/{tournId}/rpool/{rpoolId}/room/{roomId}'   , module : updateRPoolRoom }   ,
	{ path : '/tab/{tournId}/rpool/{rpoolId}/round/{roundId}' , module : updateRPoolRound }  ,
	{ path : '/tab/{tournId}/rpool/{rpoolId}/rooms'           , module : updateRPoolRooms }  ,
	{ path : '/tab/{tournId}/rpool/{rpoolId}/rounds'          , module : updateRPoolRounds } ,
];
