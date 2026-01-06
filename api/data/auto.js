import { SequelizeAuto } from 'sequelize-auto';
import config from '../../config/config.js';
import autoConfig from '../../config/sequelize-auto.config.js';

const auto = new SequelizeAuto(
	autoConfig.database || config.DB_DATABASE,
	autoConfig.user || config.DB_USER,
	autoConfig.pass || config.DB_PASS,
	autoConfig.options
);

console.log(`Replacing data models with defintions from ${autoConfig.database || config.DB_DATABASE } \n`);
const results = await auto.run();
console.log(`Models generated for ${ Object.keys(results.tables).length } tables.\n`);

