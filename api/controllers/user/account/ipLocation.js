import UAParser from 'ua-parser-js';
import { findLocation, findISP } from '../../../helpers/clientInfo.js';
import { queryLogger } from '../../../helpers/logger.js';

const ipLocation = {
	GET: async (req, res) => {
		const requestIP = req.params.ipAddress || req.get('x-forwarded-for');

		let locationData = {};

		try {
			locationData = await findLocation(requestIP);
		} catch (err) {
			return res.status(200).json({ message: `No location data found for ${requestIP}.`, err });
		}

		try {
			const ispData = await findISP(requestIP);
			locationData.isp = ispData?.isp;
			locationData.ispData = ispData;
		} catch (err) {
			queryLogger.info({ message: `IP ${requestIP} was not found in the ISP database`, err });
		}

		if (locationData === undefined) {
			return res.status(200).json({ message: `No location data found for ${requestIP}` });
		}

		if (locationData.isp && locationData.isp !== locationData.ispData.organization) {
			locationData.organization = locationData.ispData.organization;
		}

		const userAgent = UAParser(req.get('user-agent'));

		if (userAgent?.browser) {
			locationData.browser = userAgent.browser;
			locationData.device = userAgent.device;
			locationData.os = userAgent.os;
		}

		return res.status(200).json(locationData);
	},
};

export default ipLocation;
