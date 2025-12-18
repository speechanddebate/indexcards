// These paths are for tournament published data only, and can be seen by any
// users, even if not logged in.
import {
	getTournInvite,
	getRound,
	getTournEvents,
	getTournPublishedFiles,
	getTournPublishedRounds,
	getTournPublishedResults,
	getTournIdByWebname,
	getTournSchedule,
	getEventByAbbr,
} from '../../../controllers/public/invite/tourn.js';

import {
	getThisWeekTourns,
	getFutureTourns,
} from '../../../controllers/public/invite/list.js';

import {
	getEntryFieldByEvent,
} from '../../../controllers/public/invite/event.js';

export default [
	{ path: '/public/invite/webname/:webname'                 , module : getTournIdByWebname}       ,
	{ path: '/public/invite/:tournId'                         , module : getTournInvite }           ,
	{ path: '/public/invite/:tournId/events'                  , module : getTournEvents }           ,
	{ path: '/public/invite/:tournId/events/:eventAbbr/field' , module : getEntryFieldByEvent }     ,
	{ path: '/public/invite/:tournId/events/:eventAbbr'       , module : getEventByAbbr }           ,
	{ path: '/public/invite/:tournId/files'                   , module : getTournPublishedFiles }   ,
	{ path: '/public/invite/:tournId/rounds'                  , module : getTournPublishedRounds }  ,
	{ path: '/public/invite/:tournId/results'                 , module : getTournPublishedResults } ,
	{ path: '/public/invite/:tournId/round/:roundId'          , module : getRound }                 ,
	{ path: '/public/invite/:tournId/schedule'                , module : getTournSchedule }         ,
	{ path: '/public/invite/upcoming'                         , module : getFutureTourns }          ,
	{ path: '/public/invite/upcoming/:circuit'                , module : getFutureTourns }          ,
	{ path: '/public/invite/thisweek'                         , module : getThisWeekTourns }        ,
];