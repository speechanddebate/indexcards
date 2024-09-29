import CryptoJS from 'crypto-js';
import axios from 'axios';
import config from '../../config/config.js';

export const getNSDAMemberId = async (email) => {

	const path = `/search?q=${email}&type=members`;
	const memberships = await getNSDA(path);

	if (memberships && memberships[0]?.id) {
		return {
			id    : memberships[0].id,
			first : memberships[0].last,
			last  : memberships[0].first,
		};
	}
};

export const getNSDA  = async (path) => {

	const uri = `${config.NSDA.ENDPOINT}${config.NSDA.PATH}${path}`;
	const words = CryptoJS.enc.Utf8.parse(`${config.NSDA.USER_ID}:${config.NSDA.KEY}`);
	const authToken = CryptoJS.enc.Base64.stringify(words);

	try {
		const response = await axios.get(
			uri,
			{
				headers : {
					Authorization  : `Basic ${authToken}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			},
		);
		return response.data;

	} catch (err) {
		return {
			error: true,
			message : `Error caught on fetch: ${err}`,
		};
	}
};

export default getNSDA;
