// Paths under /all are ones which anyone with any access to a tournament may access,
// and any further fine grained permissions must be handled by the end points themselves;
// these largely implement those few sections where checker access is sufficent

import { tournDashboard, tournAttendance } from '../../../controllers/tab/all/dashboard.js';
import { eventCheckin, categoryCheckin } from '../../../controllers/tab/all/checkin.js';

export default [
	{ path : '/tab/{tournId}/all/dashboard'                     , module : tournDashboard }  ,
	{ path : '/tab/{tournId}/all/attendance'                    , module : tournAttendance } ,
	{ path : '/tab/{tournId}/all/category/{categoryId}/checkin' , module : categoryCheckin } ,
	{ path : '/tab/{tournId}/all/event/{eventId}/checkin'       , module : eventCheckin }    ,
];
