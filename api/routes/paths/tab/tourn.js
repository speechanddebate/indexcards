// These paths are particular to tournament administration, and so require a
// logged in user with access to the tournament in question.
import { updateTourn } from '../../../controllers/tab/tourn/index.js';
import { backupTourn, restoreTourn } from '../../../controllers/tab/tourn/backup.js';
import { changeAccess, backupAccess } from '../../../controllers/tab/tourn/access.js';

export default [
	{ path : '/tab/{tournId}'                         , module : updateTourn }         ,
	{ path : '/tab/{tournId}/backup'                  , module : backupTourn }         ,
	{ path : '/tab/{tournId}/restore'                 , module : restoreTourn }        ,
	{ path : '/tab/{tournId}/access/{personId}'       , module : changeAccess }        ,
	{ path : '/tab/{tournId}/backupAccess/{personId}' , module : backupAccess }        ,
];
