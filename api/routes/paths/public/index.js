// These paths are for tournament published data only, and can be seen by any
// users, even if not logged in.

import { getInvite, getRounds } from '../../../controllers/public/invite/tournInvite';
import { futureTourns } from '../../../controllers/public/invite/tournList';
import { searchTourns, searchCircuitTourns } from '../../../controllers/public/search';
import { getAds } from '../../../controllers/public/ads';

export default [
	{ path: '/public/invite/{webname}'                              , module : getInvite }           ,
	{ path: '/public/invite/tourn/{tourn_id}'                       , module : getInvite }           ,
	{ path: '/public/invite/round/{round_id}'                       , module : getRounds }           ,
	{ path: '/public/invite/upcoming'                               , module : futureTourns }        ,
	{ path: '/public/invite/upcoming/:circuit'                      , module : futureTourns }        ,
	{ path: '/public/search/:time/:searchString/circuit/:circuitId' , module : searchCircuitTourns } ,
	{ path: '/public/search/:time/:searchString'                    , module : searchTourns }        ,
	{ path: '/public/ads'                                           , module : getAds }              ,
];
