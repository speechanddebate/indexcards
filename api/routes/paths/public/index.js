// These paths are for tournament published data only, and can be seen by any
// users, even if not logged in.

import { getInvite, getRounds } from '../../../controllers/public/invite/tournInvite.js';
import { futureTourns, thisWeek } from '../../../controllers/public/invite/tournList.js';
import { searchTourns, searchCircuitTourns } from '../../../controllers/public/search.js';
import { getAds } from '../../../controllers/public/ads.js';
import { getPageBySlug, getAllPages, getPagesByTourn } from '../../../controllers/public/page.js';
export default [
	{ path: '/public/invite/:webname'                              , module : getInvite }           ,
	{ path: '/public/invite/tourn/:tournId'                        , module : getInvite }           ,
	{ path: '/public/invite/round/:roundId'                        , module : getRounds }           ,
	{ path: '/public/invite/tourn/:tournId/pages'                  , module : getPagesByTourn }     ,
	{ path: '/public/invite/upcoming'                               , module : futureTourns }        ,
	{ path: '/public/invite/upcoming/:circuit'                      , module : futureTourns }        ,
	{ path: '/public/invite/thisweek'                               , module : thisWeek }            ,
	{ path: '/public/search/:time/:searchString/circuit/:circuitId' , module : searchCircuitTourns } ,
	{ path: '/public/search/:time/:searchString'                    , module : searchTourns }        ,
	{ path: '/public/ads'                                           , module : getAds }              ,
	{ path: '/public/pages'                                         , module : getAllPages }         ,
	{ path: '/public/pages/:slug'                                   , module : getPageBySlug }       ,
];
