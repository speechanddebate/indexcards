// share.tabroom.com external functions.
// These endpoints require an API key which contains a user ID
// with a valid key and access to the api_auth_share property.

// Router controllers
import { circuitQualifiers } from '../../../controllers/tab/result/qualifier.js';

export default [
	{ path : '/tab/{tourn_id}/result/postQualifiers' , module : circuitQualifiers } ,
];
