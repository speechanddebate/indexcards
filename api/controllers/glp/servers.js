import axios from 'axios';
import config from '../../../config/config.js';

export const showTabroomMachines = {

	GET: async (req, res) => {

		const existingMachines = await axios.get(
			`${config.LINODE.API_URL}/instances`,
			{
				headers : {
					Authorization  : `Bearer ${config.LINODE.API_TOKEN}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			},
		);

		const tabroomMachines = await existingMachines.data.data.filter( (machine) => {

			if (
				machine.tags.includes('tabroom-db')
				|| machine.tags.includes('tabroom-replica')
				|| machine.tags.includes('tabweb')
			) {
				return machine;
			}

			return null;
		});

		return res.status(200).json(tabroomMachines);
	},
};

export default showTabroomMachines;
