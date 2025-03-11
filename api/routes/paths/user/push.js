import { enablePushNotifications, disablePushNotifications } from '../../../controllers/user/person/notifications.js';
import pushMessage from '../../../controllers/user/blast.js';

export default [
	{ path : '/user/push/disable' , module : disablePushNotifications } ,
	{ path : '/user/push/enable'  , module : enablePushNotifications }  ,
	{ path : '/user/push/send'    , module : pushMessage }              ,
];
