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

export default db;
