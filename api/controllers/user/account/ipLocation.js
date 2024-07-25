import UAParser from 'ua-parser-js';
import { findLocation, findISP } from '../../../helpers/clientInfo';

const ipLocation = {
	GET: async (req, res) => {
		const requestIP = req.params.ipAddress || req.get('x-forwarded-for');
		const locationData = await findLocation(requestIP);
		const ispData = await findISP(requestIP);
		const userAgent = UAParser(req.get('user-agent'));

		if (locationData === undefined) {
			return res.status(200).json({ message: `No location data found for ${requestIP}` });
		}

		locationData.isp = ispData?.isp;

		if (ispData.isp !== ispData.organization) {
			locationData.organization = ispData.organization;
		}

		locationData.browser = userAgent.browser;
		locationData.device = userAgent.device;
		locationData.os = userAgent.os;
		return res.status(200).json(locationData);
	},
};

export default ipLocation;
