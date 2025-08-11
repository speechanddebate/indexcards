// These paths are particular to tournament administration, and so require a
// logged in user with access to the tournament in question.

// Utility functions
import caselist from './caselist.js';
import share from './share.js';
import nsda from './nsda.js';
import mason from './mason.js';
// Except this one shouldn't require a logged in user or key
import { login } from '../../../controllers/ext/session/login.js';

export default [
	{ path : '/ext/login', module: login } ,
	...caselist,
	...share,
	...nsda,
	...mason,
];
