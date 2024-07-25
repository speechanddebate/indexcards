// Integrations with NSDA gateways, payments and services that require share keys

// Router controllers
import getPersonHistory from '../../../controllers/ext/nsda/getPersonHistory';
import { postPayment } from '../../../controllers/ext/nsda/payment';
import ipLocation from '../../../controllers/user/account/ipLocation';
import { syncNatsAppearances, natsIndividualHonors } from '../../../controllers/ext/nsda/natsAppearances';

export default [
	{ path : '/ext/nsda/history'                 , module : getPersonHistory }     ,
	{ path : '/ext/nsda/payment'                 , module : postPayment }          ,
	{ path : '/ext/nsda/payment/tourn/{tournId}' , module : postPayment }          ,
	{ path : '/ext/nsda/nats/appearances'        , module : syncNatsAppearances }  ,
	{ path : '/ext/nsda/nats/placements'         , module : natsIndividualHonors } ,
	{ path : '/ext/iplocation/{ip_address}'      , module : ipLocation }           ,
];
