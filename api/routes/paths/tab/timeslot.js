import { updateTimeslot } from '../../../controllers/tab/timeslot/index.js';
import { blastTimeslotMessage, blastTimeslotPairings, messageFreeJudges }  from '../../../controllers/tab/timeslot/blast.js';
import { mergeTimeslotRounds, unmergeTimeslotRounds } from '../../../controllers/tab/timeslot/round.js';
import { tournDashboard, tournAttendance } from '../../../controllers/tab/all/dashboard.js';

export default [
	{ path : '/tab/{tournId}/timeslot/{timeslotId}'              , module : updateTimeslot }        ,
	{ path : '/tab/{tournId}/timeslot/{timeslotId}/blast'        , module : blastTimeslotPairings } ,
	{ path : '/tab/{tournId}/timeslot/{timeslotId}/message'      , module : blastTimeslotMessage }  ,
	{ path : '/tab/{tournId}/timeslot/{timeslotId}/message/free' , module : messageFreeJudges }     ,
	{ path : '/tab/{tournId}/timeslot/{timeslotId}/merge'        , module : mergeTimeslotRounds }   ,
	{ path : '/tab/{tournId}/timeslot/{timeslotId}/unmerge'      , module : unmergeTimeslotRounds } ,
	{ path : '/tab/{tournId}/timeslot/{timeslotId}/dashboard'    , module : tournDashboard }        ,
	{ path : '/tab/{tournId}/timeslot/{timeslotId}/attendance'   , module : tournAttendance }       ,
];
