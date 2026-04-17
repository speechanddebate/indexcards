import { SequelizeAuto } from 'sequelize-auto';
import config from '../../config/config.js';
import autoConfig from '../../config/sequelize-auto.config.js';

const auto = new SequelizeAuto(
	autoConfig.database || config.DB_DATABASE,
	autoConfig.user || config.DB_USER,
	autoConfig.pass || config.DB_PASS,
	{
		...autoConfig.options,
		host: autoConfig.options?.host || config.DB_HOST,
		port: autoConfig.options?.port || config.DB_PORT,
	}
);
console.log('Connecing to database at ' + (autoConfig.options?.host || config.DB_HOST) + ':' + (autoConfig.options?.port || config.DB_PORT) + ' with user ' + (autoConfig.user || config.DB_USER) + '\n');
console.log(`Replacing data models with defintions from ${autoConfig.database || config.DB_DATABASE } \n`);
const results = await auto.run();
console.log(`Models generated for ${ Object.keys(results.tables).length } tables.\n`);

