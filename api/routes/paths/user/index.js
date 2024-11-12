// These paths are ones that require a logged in user but are outside the scope
// of tournament administration.  Typically these are registration & user
// account functions.
import judge from './judge.js';
import inbox from './inbox.js';
import push from './push.js';
import login from '../../../controllers/user/account/login.js'; // Except this one shouldn't require a logged in user or key
import getProfile from '../../../controllers/user/account/getProfile.js';
import acceptPayPal from '../../../controllers/user/enter/acceptPayPal.js';
import processAuthorizeNet from '../../../controllers/user/enter/processAuthorizeNet.js';
import updateLastAccess from '../../../controllers/user/account/access.js';
import updateLearnCourses from '../../../controllers/user/account/learnCourse.js';

export default [
	{ path : '/login'                       , module : login }               ,
	{ path : '/user/updateLastAccess'       , module : updateLastAccess }    ,
	{ path : '/user/profile'                , module : getProfile }          ,
	{ path : '/user/profile/{personId}'     , module : getProfile }          ,
	{ path : '/user/enter/paypal'           , module : acceptPayPal }        ,
	{ path : '/user/enter/authorize'        , module : processAuthorizeNet } ,
	{ path : '/user/updateLearn'            , module : updateLearnCourses }  ,
	{ path : '/user/updateLearn/{personId}' , module : updateLearnCourses }  ,
	...push                                 ,
	...judge                                ,
	...inbox                                ,
];
