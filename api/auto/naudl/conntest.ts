import axios from 'axios';
import config from '../../config.js';

const salesforceAuth = async () => {
	const naudl = config.naudl;

	try {
		const authClient = `grant_type=password&client_id=${naudl.client_id}&client_secret=${naudl.client_secret}`;
		const authUser = `&username=${naudl.username}&password=${naudl.pw}`;
		const response = await axios.post(
			`https://login.salesforce.com/services/oauth2/token?${authClient}${authUser}`,
		);
		return response?.data ? response.data : undefined;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export default salesforceAuth;
