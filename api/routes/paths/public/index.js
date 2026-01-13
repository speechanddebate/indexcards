// These paths are for tournament published data only, and can be seen by any
// users, even if not logged in.
import { searchTourns, searchCircuitTourns } from '../../../controllers/public/search.js';

export default [
	{ path: '/public/search/:time/:searchString/circuit/:circuitId' , module : searchCircuitTourns } ,
	{ path: '/public/search/:time/:searchString'                    , module : searchTourns }        ,
];
