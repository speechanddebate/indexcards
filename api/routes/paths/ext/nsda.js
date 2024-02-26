// Integrations with NSDA gateways, payments and services that require share keys

// Router controllers
import getPersonHistory from '../../../controllers/ext/nsda/getPersonHistory';
import { postPayment } from '../../../controllers/ext/nsda/payment';
import { syncNatsAppearances } from '../../../controllers/ext/nsda/natsAppearances';

export default [
	{ path : '/ext/nsda/history'                  , module : getPersonHistory }    ,
	{ path : '/ext/nsda/payment'                  , module : postPayment }         ,
	{ path : '/ext/nsda/payment/tourn/{tourn_id}' , module : postPayment }         ,
	{ path : '/ext/nsda/nats/appearances'         , module : syncNatsAppearances } ,
];
