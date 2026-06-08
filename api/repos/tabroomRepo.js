import db from '../data/db.js';
import { Op } from 'sequelize';

async function getSettings(settings) {
	return db.tabroomSetting.findAll({
		where: {
			tag: {
				[Op.in]: settings,
			},
		},
	});
}

export default {
	getSettings,
};