// Router controllers
import { messageJPool } from '../../../controllers/tourn/section/blast/message.js';
import { eraseJPool, populateStandby } from '../../../controllers/tourn/section/manageJPools.js';

export default [
	{ path : '/tourn/{tournId}/jpool/{jpoolId}/message'  , module : messageJPool }    ,
	{ path : '/tourn/{tournId}/jpool/{jpoolId}/populate' , module : populateStandby } ,
	{ path : '/tourn/{tournId}/jpool/{jpoolId}/erase'    , module : eraseJPool }      ,
];
