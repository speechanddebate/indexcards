import { syncLearnResults } from '../../../helpers/nsda.js';

export const updateLearnCourses = {

	GET: async (req, res) => {

		if (!req.session) {
			return res.status(401).json('You are not logged in');
		}

		let targetPersonId = 0;

		if (req.params.personId && req.session.site_admin) {
			targetPersonId = req.params.personId;
		} else if (req.session.person) {
			targetPersonId = req.session.person;
		} else if (req.params.personId) {
			return res.status(401).json('Only a site admin may check other the courses of other users');
		} else {
			return res.status(401).json('Tabroom user account has no NSDA membership');
		}

		const response = await syncLearnResults(targetPersonId);
		return res.status(200).json(response);

	},
};

export default updateLearnCourses;
