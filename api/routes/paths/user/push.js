import { pushSubscribe, pushSync } from '../../../controllers/user/account/notifications.js';
import { pushMessage, getSubscription } from '../../../controllers/user/blast.js';

export default [
	{ path : '/user/push/{subscriptionId}/{subStatus}'      , module : pushSubscribe }   ,
	{ path : '/user/push/show/{tabroomId}/{subscriptionId}' , module : pushSubscribe }   ,
	{ path : '/user/push/sync'                              , module : pushSync }        ,
	{ path : '/user/push/send'                              , module : pushMessage }     ,
	{ path : '/user/push/find'                              , module : getSubscription } ,
];
