import { syncLearnResults } from '../../../helpers/nsda.js';
import { Forbidden, Unauthorized } from '../../../helpers/problem.js';

export const updateLearnCourses = {

	GET: async (req, res) => {

		if (!req.session) {
			return Unauthorized(req, res, 'You are not logged in');
		}

		let targetPersonId = 0;

		if (req.params.personId && req.person.siteAdmin) {
			targetPersonId = req.params.personId;
		} else if (req.session.personId) {
			targetPersonId = req.session.personId;
		} else if (req.params.personId) {
			return Forbidden(req, res, 'Only a site admin may check other the courses of other users');
		} else {
			return Forbidden(req, res, 'Tabroom user account has no NSDA membership');
		}
		const response = await syncLearnResults(targetPersonId);
		return res.status(200).json(response);
	},
};

export default updateLearnCourses;
