import { Router } from 'express';
import { updateContact, deleteContact, userProfile } from '../../../../controllers/coach/contacts.js';

const router = Router();

// /coach/{chapterId}/school/{schoolId}/updateContact
router.post('/:chapterId/school/:schoolId/updateContact', updateContact);
// /coach/{chapterId}/school/:schoolId/deleteContact
router.post('/:chapterId/school/:schoolId/deleteContact', deleteContact);
// /person/{personId}
router.get('/person/:personId', userProfile);
// /person
router.get('/person', userProfile);

export default router;
