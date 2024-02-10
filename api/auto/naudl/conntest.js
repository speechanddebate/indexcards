import axios from 'axios';
import config from '../../../config/config';

const salesforceAuth = async () => {
	const naudl = config.NAUDL;

	try {
		const authClient = `grant_type=password&client_id=${naudl.CLIENT_ID}&client_secret=${naudl.CLIENT_SECRET}`;
		const authUser = `&username=${naudl.USERNAME}&password=${naudl.PW}`;
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
