// These paths affect a coach/director level access to their program or school.
import { updateContact } from '../../../controllers/coach/contacts.js';

export default [
	{ path : '/coach/{chapterId}/school/{schoolId}/updateContact' , module : updateContact } ,
];
