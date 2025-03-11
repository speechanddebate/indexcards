// Integrations with NSDA gateways, payments and services that require share keys

// Router controllers
import getPersonHistory from '../../../controllers/ext/nsda/getPersonHistory.js';
import { postPayment } from '../../../controllers/ext/nsda/payment.js';
import ipLocation from '../../../controllers/user/person/ipLocation.js';
import { syncNatsAppearances, natsIndividualHonors } from '../../../controllers/ext/nsda/natsAppearances.js';

export default [
	{ path : '/ext/nsda/history'                 , module : getPersonHistory }     ,
	{ path : '/ext/nsda/payment'                 , module : postPayment }          ,
	{ path : '/ext/nsda/payment/tourn/{tournId}' , module : postPayment }          ,
	{ path : '/ext/nsda/nats/appearances'        , module : syncNatsAppearances }  ,
	{ path : '/ext/nsda/nats/placements'         , module : natsIndividualHonors } ,
	{ path : '/ext/iplocation/{ipAddress}'       , module : ipLocation }           ,
];
