// These paths are ones that require a logged in user but are outside the scope
// of tournament administration.  Typically these are registration & user
// account functions.
import login from '../../../controllers/user/account/login'; // Except this one shouldn't require a logged in user or key
import getProfile from '../../../controllers/user/account/getProfile';
import acceptPayPal from '../../../controllers/user/enter/acceptPayPal';
import processAuthorizeNet from '../../../controllers/user/enter/processAuthorizeNet';
import { enablePushNotifications, disablePushNotifications } from '../../../controllers/user/account/setNotifications.js';
import pushMessage from '../../../controllers/user/blast.js';
import judge from './judge';
import inbox from './inbox';

export default [
	{ path : '/login'                       , module : login }                    ,
	{ path : '/user/profile'                , module : getProfile }               ,
	{ path : '/user/profile/{person_id}'    , module : getProfile }               ,
	{ path : '/user/enter/paypal'           , module : acceptPayPal }             ,
	{ path : '/user/enter/authorize'        , module : processAuthorizeNet }      ,
	{ path : '/user/push/enable'            , module : enablePushNotifications }  ,
	{ path : '/user/push/disable'           , module : disablePushNotifications } ,
	{ path : '/user/push/send'              , module : pushMessage }              ,
	...judge                                ,
	...inbox                                ,
];
