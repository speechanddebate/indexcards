/* eslint import/namespace: 'off' */

/*
 * Eslint does not support import assertions because they only
 * support stage-4 language features.
 *
 * It's annoying and can't be disabled. So instead this file
 * will import all JSON and you can then import it from here.
 *
 * This way, we just ignore this file in eslint and voila, enough
 * of reading threads of whiny "It isn't STAGE 4 YET!" on github.
 *
 */

import packageData from '../package.json' with { type: 'json' };

export {
	packageData,
};
