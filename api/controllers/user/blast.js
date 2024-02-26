import notify from '../../helpers/blast';
import config from '../../../config/config';

export const pushMessage = {

	POST: async (req, res) => {

		const responseJSON = await notify({
			...req.body,
		});

		res.status(200).json(responseJSON);
	},
};

export default pushMessage;
