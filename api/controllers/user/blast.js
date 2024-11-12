import notify from '../../helpers/blast.js';

export const pushMessage = {

	POST: async (req, res) => {

		const responseJSON = await notify({
			...req.body,
		});

		res.status(200).json(responseJSON);
	},
};

export default pushMessage;
