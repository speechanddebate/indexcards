// These paths are ones that require a caselist_key
import getPersonChapters from '../../../controllers/ext/caselist/getPersonChapters';
import getPersonRounds from '../../../controllers/ext/caselist/getPersonRounds';
import getPersonStudents from '../../../controllers/ext/caselist/getPersonStudents';
import postCaselistLink from '../../../controllers/ext/caselist/postCaselistLink';

export default [
	{ path : '/ext/caselist/chapters' , module : getPersonChapters } ,
	{ path : '/ext/caselist/rounds'   , module : getPersonRounds }   ,
	{ path : '/ext/caselist/students' , module : getPersonStudents } ,
	{ path : '/ext/caselist/link'     , module : postCaselistLink }  ,
];
