// These paths are for tournament published data only, and can be seen by any
// users, even if not logged in.
import { searchTourns, searchCircuitTourns } from '../../../controllers/public/search.js';
import { getAds } from '../../../controllers/public/ads.js';
import { getPageBySlug, getAllPages } from '../../../controllers/public/page.js';
import invite from './invite.js';

export default [
	{ path: '/public/search/:time/:searchString/circuit/:circuitId' , module : searchCircuitTourns } ,
	{ path: '/public/search/:time/:searchString'                    , module : searchTourns }        ,
	{ path: '/public/ads'                                           , module : getAds }              ,
	{ path: '/public/pages'                                         , module : getAllPages }         ,
	{ path: '/public/pages/:slug'                                   , module : getPageBySlug }       ,
	...invite,
];
