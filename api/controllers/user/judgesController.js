// return judges the user has requested to link to that have not been approved yet
async function linkRequests(req, res) {
	return res.status(200).json([]);
};

export default {
	linkRequests,
};