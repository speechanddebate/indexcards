import { enablePushNotifications, disablePushNotifications } from '../../../controllers/user/account/notifications.js';
import pushMessage from '../../../controllers/user/blast.js';

export default [
	{ path : '/user/push/disable' , module : disablePushNotifications } ,
	{ path : '/user/push/enable'  , module : enablePushNotifications }  ,
	{ path : '/user/push/send'    , module : pushMessage }              ,
];
