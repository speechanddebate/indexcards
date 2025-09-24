// These paths are ones that require a logged in user but are outside the scope
// of tournament administration.  Typically these are registration & user
// account functions.
import getSession from '../../../controllers/user/person/session.js';
import getProfile from '../../../controllers/user/person/getProfile.js';
import acceptPayPal from '../../../controllers/user/enter/acceptPayPal.js';
import processAuthorizeNet from '../../../controllers/user/enter/processAuthorizeNet.js';
import updateLastAccess from '../../../controllers/user/person/access.js';
import updateLearnCourses from '../../../controllers/user/person/learnCourse.js';
import judge from './judge.js';
import inbox from './inbox.js';
import push from './push.js';
import chapter from './chapter.js';

export default [
	{ path : '/user/session'                , module : getSession }          ,
	{ path : '/user/updateLastAccess'       , module : updateLastAccess }    ,
	{ path : '/user/profile'                , module : getProfile }          ,
	{ path : '/user/profile/{personId}'     , module : getProfile }          ,
	{ path : '/user/enter/paypal'           , module : acceptPayPal }        ,
	{ path : '/user/enter/authorize'        , module : processAuthorizeNet } ,
	{ path : '/user/updateLearn'            , module : updateLearnCourses }  ,
	{ path : '/user/updateLearn/{personId}' , module : updateLearnCourses }  ,
	...push                                 ,
	...chapter                              ,
	...judge                                ,
	...inbox                                ,
];
