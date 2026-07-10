import { SequelizeAuto } from 'sequelize-auto';
import config from '../config.js';
import autoConfig from '../../config/sequelize-auto.config.js';

const auto = new SequelizeAuto(
	autoConfig.database || config.DB.DATABASE || config.DB_DATABASE,
	autoConfig.user || config.DB.USER || config.DB_USER,
	autoConfig.pass || config.DB.PASS || config.DB_PASS,
	{
		...autoConfig.options,
		host: autoConfig.options?.host || config.DB.HOST || config.DB_HOST,
		port: autoConfig.options?.port || config.DB.PORT || config.DB_PORT,
	}
);

console.log(`Connecting to database at ${autoConfig.options?.host || config.DB.HOST || config.DB_HOST}:`);
console.log(`${autoConfig.options?.port || config.DB.PORT || config.DB_PORT} with user `);
console.log(`${autoConfig.user || config.DB_USER} \n`);
console.log(`Replacing data models with defintions from ${autoConfig.database || config.DB_DATABASE } \n`);
const results = await auto.run();
console.log(`Models generated for ${ Object.keys(results.tables).length } tables.\n`);

