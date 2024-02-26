import { sideCounts, roundDecisionStatus } from '../../../controllers/tab/round/index.js';
import { roundChangeLog } from '../../../controllers/tab/round/changeLog.js';
import { blastRoundPairing, blastRoundMessage } from '../../../controllers/tab/round/blast.js';
import { tournDashboard, tournAttendance } from '../../../controllers/tab/all/dashboard.js';
import { makeShareRooms } from '../../../controllers/tab/round/share.js';

export default [
	{ path : '/tab/{tournId}/round/{roundId}/sidecount'      , module : sideCounts }          ,
	{ path : '/tab/{tournId}/round/{roundId}/status'         , module : roundDecisionStatus } ,
	{ path : '/tab/{tournId}/round/{roundId}/log'            , module : roundChangeLog }      ,
	{ path : '/tab/{tournId}/round/{roundId}/blast'          , module : blastRoundPairing }   ,
	{ path : '/tab/{tournId}/round/{roundId}/message'        , module : blastRoundMessage }   ,
	{ path : '/tab/{tournId}/round/{roundId}/dashboard'      , module : tournDashboard }      ,
	{ path : '/tab/{tournId}/round/{roundId}/attendance'     , module : tournAttendance }     ,
	{ path : '/tab/{tournId}/round/{roundId}/makeShareRooms' , module : makeShareRooms }      ,
];
