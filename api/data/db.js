import { Sequelize } from 'sequelize';
import { errorLogger, debugLogger } from '../helpers/logger.js';
import config from '../../config/config.js';
import initModels from './models/init-models.js';

const sequelize = new Sequelize(
	config.DB_DATABASE,
	config.DB_USER,
	config.DB_PASS,
	config.sequelizeOptions
);

// initalize all models created by sequelize-auto
const db = initModels(sequelize);

//TODO for some reason this realationship isn't created in init-models. need to investigate later
db.session.belongsTo(db.person, { as: 'su_person', foreignKey: 'su' });

// Ensure round <-> timeslot association exists (init-models may not create it)
db.round.belongsTo(db.timeslot, { as: 'timeslot_timeslot', foreignKey: 'timeslot' });
db.timeslot.hasMany(db.round, { as: 'rounds', foreignKey: 'timeslot' });

// Ensure chapterJudge <-> person association exists
db.chapterJudge.belongsTo(db.person, { as: 'person_person', foreignKey: 'person' });
db.person.hasMany(db.chapterJudge, { as: 'chapter_judges', foreignKey: 'person' });
// judge to school
db.judge.belongsTo(db.school, { as: 'school_school', foreignKey: 'school' });
db.school.hasMany(db.judge, { as: 'judges', foreignKey: 'school' });
// person to judge
db.person.hasMany(db.judge, { as: 'judges', foreignKey: 'person' });
db.judge.belongsTo(db.person, { as: 'person_person', foreignKey: 'person' });

// By default Sequelize wants you to try...catch every single database call
// for Reasons?  Otherwise all your database errors just go unprinted and you
// get a random unfathomable 500 error.  Yeah, because that's great.  This will
// try/catch every query so I don't have to deal with that nonsense,
// and will get errors logged for free.

const errorsPlease = ['findAll', 'findOne', 'save', 'create', 'findByPk'];

const dbError = (err) => {
	debugLogger.error(err);
	return `Database query error`;
};

errorsPlease.forEach((dingbat) => {
	const originalFunction = Sequelize[dingbat];
	Sequelize[dingbat] = (...args) => {
		return originalFunction.apply(this, args).catch(err => {
			dbError(err);
		});
	};
});

// a standard getter for Tabroom objects that have settings because Palmer is teh lazy

db.summon = async (dbTable, objectId) => {

	const options = {};
	let settingsAlias = null;

	if (dbTable?.associations) {
		for (const assocName in dbTable.associations) {
			const assoc = dbTable.associations[assocName];

			if (assoc.as?.toLowerCase().includes('_setting')) {
				const settingModelName = dbTable.tableName + 'Setting';   // e.g. "personSetting"
				const settingModel = db[settingModelName];
				options.include = [{model: settingModel, as: assoc.as }];
				settingsAlias = assoc.as;
				break;
			}
		}
	}

	let dbObject = {};

	try {
		dbObject = await dbTable.findByPk(
			objectId,
			options
		);
	} catch (err) {
		errorLogger.info(`SUMMON QUERY RETURNED ERROR: ${err} for model ${dbTable} PK ${objectId}`);
		return;
	}

	if (!dbObject) {
		errorLogger.info(`NOTHING FOUND: No ${dbTable} record found with key ${objectId}`);
		return;
	}

	const dbData = dbObject.get({ plain: true });
	dbData.table = dbTable.tableName;

	const settings = settingsAlias ? dbData[settingsAlias] : null;

	if (settings) {
		dbData.settings = {};

		settings
			.sort((a, b) => { return (a.tag > b.tag) ? 1 : -1; })
			.forEach( (item) => {
				if (item.tag === 'nsda_membership') {
					//
				} else if (item.value === 'date' && item.value_date) {
					if (item.value_date !== null) {
						dbData.settings[item.tag] = item.value_date;
					}
				} else if (item.value === 'json') {
					if (item.value_text) {
						let jsonOutput;
						try {
							jsonOutput = JSON.parse(item.value_text);
						} catch (err) {
							errorLogger.info(item.tag);
							errorLogger.info(err);
						}
						if (jsonOutput) {
							dbData.settings[item.tag] = jsonOutput;
						}
					}
				} else if (item.value === 'text') {
					if (item.value_text !== null) {
						dbData.settings[item.tag] = item.value_text;
					}
				} else {
					dbData.settings[item.tag] = item.value;
				}
			});

		delete dbData[settingsAlias];
	}

	return dbData;
};

// And hell, if we're going to be grabbing settings that way might as well build
// a standard way to then change them.

db.setting = async (origin, settingTag, settingValue) => {

	if (origin.table === undefined) {
		return;
	}

	const setKey = `${origin.table}Setting`;

	if (typeof settingValue !== 'undefined') {

		if (settingValue === 0 || settingValue === '' || settingValue === null) {
			await db[setKey].destroy({
				where: { [origin.table] : origin.id, tag: settingTag },
			});
			return;
		}

		await db[setKey].findOrCreate({
			where: { [origin.table] : origin.id, tag: settingTag },
		});

		const updateTo = {};
		let returnValue = '';

		if (typeof (settingValue) === 'object') {
			if (settingValue.text) {
				updateTo.value = 'text';
				updateTo.value_text = settingValue.text;
				returnValue = settingValue.text;
			} else if (settingValue.date) {
				const newDate = new Date(settingValue.date);
				updateTo.value = 'date';
				updateTo.value_date = newDate;
				returnValue = newDate;
			} else if (settingValue.json) {
				updateTo.value = 'json';
				updateTo.value_text = JSON.stringify(settingValue.json);
				returnValue = settingValue.json;
			}
		} else {
			updateTo.value = settingValue;
			returnValue = settingValue;
		}

		await db[setKey].update(
			updateTo,
			{ where: { [origin.table] : origin.id, tag: settingTag } }
		);

		return returnValue;
	}

	const setValue = await db[setKey].findOne({
		where: {
			[origin.table]: origin.id,
			tag: settingTag,
		},
	});

	if (setValue) {

		const settingResult = setValue.get({ plain: true });

		if (settingResult.value === 'json') {
			if (settingResult.value_text) {
				return JSON.parse(settingResult.value_text);
			}
		} else if (settingResult.value === 'date') {
			if (settingResult.value_date) {
				return settingResult.value_date;
			}
		} else if (settingResult.value === 'text') {
			if (settingResult.value_text) {
				return settingResult.value_text;
			}
		} else if (settingResult.value) {
			return settingResult.value;
		}
	}
};

// Initialize the data objects.
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
