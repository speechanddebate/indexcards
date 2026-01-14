import { pushSubscribe, pushSync } from '../../../controllers/user/person/notifications.js';
import { getSubscription } from '../../../controllers/user/blast.js';

export default [
	{ path : '/user/push/{subscriptionId}/{subStatus}'      , module : pushSubscribe }   ,
	{ path : '/user/push/show/{tabroomId}/{subscriptionId}' , module : pushSubscribe }   ,
	{ path : '/user/push/sync'                              , module : pushSync }        ,
	{ path : '/user/push/find'                              , module : getSubscription } ,
];
