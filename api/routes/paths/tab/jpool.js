// JPool is a direct descendant of Category and therefore the auth framework will automatically verify
// Category and Tourn level permissions for it.
import {
	updateJPool,
	updateJPoolJudge,
	updateJPoolRound,
	updateJPoolJudges,
	updateJPoolRounds,
} from '../../../controllers/tab/jpool/index.js';

import { blastJudges } from '../../../controllers/tab/jpool/blast.js';
import { placeJudgesNats, placeSuppOnlyJudges } from '../../../controllers/tab/jpool/nats.js';
import { placeJudgesStandby } from '../../../controllers/tab/jpool/standby.js';

export default [
	{ path : '/tab/{tournId}/jpool/{jpoolId}'                      , module : updateJPool }         ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/blast'                , module : blastJudges }         ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/placeJudges/standby'  , module : placeJudgesStandby }  ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/judge/{judgeId}'      , module : updateJPoolJudge }    ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/round/{roundId}'      , module : updateJPoolRound }    ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/judges'               , module : updateJPoolJudges }   ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/rounds'               , module : updateJPoolRounds }   ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/placeJudges/nats'     , module : placeJudgesNats }     ,
	{ path : '/tab/{tournId}/jpool/{jpoolId}/placeJudges/suppOnly' , module : placeSuppOnlyJudges } ,
];
