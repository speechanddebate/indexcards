import { Sequelize } from 'sequelize';
import config from '../../config/config.js';

// Tabroom often does not use the ORM fully but instead just takes advantage of
// Sequelize as a query wrapper which handles things like santizing inputs.
// This edition of the library just initializes the database for query only
// without digging too deep into the model associations, useful for things like
// command line scripts outside of the full app.

const sequelize = new Sequelize(
	config.DB_DATABASE,
	config.DB_USER,
	config.DB_PASS,
	config.sequelizeOptions
);

// Initialize the data objects.

export const db = {
	sequelize,
	Sequelize,
};

export const massUpdate = async (updateQuery, rawIds, key = 'id') => {

	const cleanIds = rawIds.map( (raw) => { return raw[key]; });
	const allArrays = [];
	let idArray = [];

	for (const idTick of cleanIds) {
		if (idArray.length > 4) {
			allArrays.push(idArray);
			idArray = [];
		}
		idArray.push(idTick);
	}

	if (idArray.length) {
		allArrays.push(idArray);
	}

	const promises = [];

	allArrays.forEach( (keys) => {
		console.log(`Updater has ${keys.length} keys to update ${JSON.stringify(keys)}`);
		const updatePromise = db.sequelize.query(
			updateQuery,
			{
				type         : db.sequelize.QueryTypes.UPDATE,
				replacements : { keys },
			}
		);
		promises.push(updatePromise);
	});

	await Promise.all(promises);
	return 'Updates complete';
};

export default db;
