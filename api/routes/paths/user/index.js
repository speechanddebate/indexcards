// These paths are ones that require a logged in user but are outside the scope
// of tournament administration.  Typically these are registration & user
// account functions.
import login from '../../../controllers/user/account/login'; // Except this one shouldn't require a logged in user or key
import getProfile from '../../../controllers/user/account/getProfile';
import acceptPayPal from '../../../controllers/user/enter/acceptPayPal';
import processAuthorizeNet from '../../../controllers/user/enter/processAuthorizeNet';
import updateLastAccess from '../../../controllers/user/account/access.js';
import judge from './judge';
import inbox from './inbox';
import push from './push';

export default [
	{ path : '/login'                    , module : login }               ,
	{ path : '/user/updateLastAccess'    , module : updateLastAccess }    ,
	{ path : '/user/profile'             , module : getProfile }          ,
	{ path : '/user/profile/{person_id}' , module : getProfile }          ,
	{ path : '/user/enter/paypal'        , module : acceptPayPal }        ,
	{ path : '/user/enter/authorize'     , module : processAuthorizeNet } ,
	...push                              ,
	...judge                             ,
	...inbox                             ,
];
