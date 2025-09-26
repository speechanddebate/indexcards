// These paths are for tournament published data only, and can be seen by any
// users, even if not logged in.
import {
	getTournInvite,
	getRound,
	getTournEvents,
	getTournPublishedFiles,
	getTournPublishedRounds,
	getTournPublishedResults,
} from '../../../controllers/public/invite/tourn.js';

import {
	getThisWeekTourns,
	getFutureTourns,
} from '../../../controllers/public/invite/list.js';

export default [
	{ path: '/public/invite/:tournId'          , module : getTournInvite }           ,
	{ path: '/public/invite/:tournId/events'   , module : getTournEvents }           ,
	{ path: '/public/invite/:tournId/files'    , module : getTournPublishedFiles }   ,
	{ path: '/public/invite/:tournId/rounds'   , module : getTournPublishedRounds }  ,
	{ path: '/public/invite/:tournId/results'  , module : getTournPublishedResults } ,
	{ path: '/public/invite/round/:roundId'    , module : getRound }                 ,
	{ path: '/public/invite/upcoming'          , module : getFutureTourns }          ,
	{ path: '/public/invite/upcoming/:circuit' , module : getFutureTourns }          ,
	{ path: '/public/invite/thisweek'          , module : getThisWeekTourns }        ,
];
