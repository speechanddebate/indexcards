import db from '../data/db.js';

async function getChangeLog(id) {
	const res = await db.changeLog.findOne({ where: { id } });
	if (!res) return null;
	return res;
}
async function createChangeLog(data) {
	const res = await db.changeLog.create(data);
	return res.id;
}

export default {
	getChangeLog,
	createChangeLog,
};
