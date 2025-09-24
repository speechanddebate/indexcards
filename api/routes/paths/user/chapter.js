// These paths are particular to tournament administration, and so require a
// logged in user with access to the tournament in question.

// Router controllers
import { userChaptersByTourn, userChapters } from '../../../controllers/user/chapter/index.js';

export default [
	{ path : '/user/chapter'           , module   : userChapters }        ,
	{ path : '/user/chapter/byTourn/{tournId}' , module   : userChaptersByTourn } ,
];
