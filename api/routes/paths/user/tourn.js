// Paths that relate a user to their roles at a tournament

import { getPersonTournPresence } from '../../../controllers/user/tourn/index.js';

export default [
	{ path : '/user/tourn/{tournId}' , module : getPersonTournPresence } ,
];
