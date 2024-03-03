// These paths affect a coach/director level access to their program or school.
import { updateContact, deleteContact } from '../../../controllers/coach/contacts.js';

export default [
	{ path : '/coach/{chapterId}/school/{schoolId}/updateContact' , module : updateContact } ,
	{ path : '/coach/{chapterId}/school/{schoolId}/deleteContact' , module : deleteContact } ,
];
