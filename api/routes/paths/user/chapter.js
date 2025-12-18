// These paths are particular to tournament administration, and so require a
// logged in user with access to the tournament in question.

// Router controllers
import {
	userChaptersByTourn,
	userChapters,
} from '../../../controllers/user/chapter/index.js';

import {
	getMySchoolsByTourn,
	getMyChaptersNonTourn,
} from '../../../controllers/user/chapter/school.js';

export default [
	{ path : '/user/chapter'                              , module : userChapters }        ,
	{ path : '/user/chapter/byTourn/{tournId}'            , module : userChaptersByTourn } ,
	{ path : '/user/chapter/byTourn/{tournId}/mySchools'  , module : getMySchoolsByTourn }   ,
	{ path : '/user/chapter/byTourn/{tournId}/nonSchools' , module : getMyChaptersNonTourn } ,
];
