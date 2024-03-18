// These paths are particular to tournament administration, and so require a
// logged in user with access to the tournament in question.

// Utility functions
import allPaths from './all.js';
import event from './event.js';
import category from './category.js';
import jpool from './jpool.js';
import round from './round.js';
import rpool from './rpool.js';
import result from './result.js';
import section from './section.js';
import timeslot from './timeslot.js';
import tourn from './tourn.js';

export default [
	...allPaths,
	...event,
	...category,
	...jpool,
	...rpool,
	...round,
	...result,
	...section,
	...timeslot,
	...tourn,
];
