// These paths are ones that require a caselist_key
import getPersonChapters from '../../../controllers/ext/caselist/getPersonChapters.js';
import getPersonRounds from '../../../controllers/ext/caselist/getPersonRounds.js';
import getPersonStudents from '../../../controllers/ext/caselist/getPersonStudents.js';
import postCaselistLink from '../../../controllers/ext/caselist/postCaselistLink.js';

export default [
	{ path : '/ext/caselist/chapters' , module : getPersonChapters } ,
	{ path : '/ext/caselist/rounds'   , module : getPersonRounds }   ,
	{ path : '/ext/caselist/students' , module : getPersonStudents } ,
	{ path : '/ext/caselist/link'     , module : postCaselistLink }  ,
];
