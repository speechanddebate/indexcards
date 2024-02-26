// Router controllers
import { updateEvent } from '../../../controllers/tab/event/index.js';
import { sectionTemplateRobin } from '../../../controllers/tab/event/roundrobin.js';
import { changeAccess, backupAccess } from '../../../controllers/tab/event/access.js';

export default [
	{ path : '/tab/{tournId}/event/{eventId}'                         , module : updateEvent }          ,
	{ path : '/tab/{tournId}/event/{eventId}/access/{personId}'       , module : changeAccess }         ,
	{ path : '/tab/{tournId}/event/{eventId}/backupAccess/{personId}' , module : backupAccess }         ,
	{ path : '/tab/{tournId}/event/{eventId}/section/robin/template'  , module : sectionTemplateRobin } ,
];
