// These paths are for tournament published data only, and can be seen by any
// users, even if not logged in.
import {
	getInvite,
	getRounds,
} from '../../../controllers/public/invite/tournInvite.js';

import { futureTourns, thisWeek } from '../../../controllers/public/invite/tournList.js';

export default [
	{ path: '/public/invite/:tournId'          , module : getInvite }    ,
	{ path: '/public/invite/round/:roundId'    , module : getRounds }    ,
	{ path: '/public/invite/upcoming'          , module : futureTourns } ,
	{ path: '/public/invite/upcoming/:circuit' , module : futureTourns } ,
	{ path: '/public/invite/thisweek'          , module : thisWeek }     ,
];
