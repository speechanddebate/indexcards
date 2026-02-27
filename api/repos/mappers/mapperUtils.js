/**
 * Helper to convert DB 0/1 or boolean to JS boolean (true/false)
 */
export function toBool(v) {
	return v === true || v === 1 || v === '1';
}

/**
 * Helper to convert JS boolean to DB 0/1
 */
export function fromBool(v) {
	return v ? 1 : 0;
}

// Usage in a fieldMap:
// FIELD_MAP = {
//   inactive: { db: 'inactive', toDomain: toBool, toDb: fromBool },
//   ...
// }
// repos/mappers/mapperUtils.js
import { flattenSettings, flattenSettingsTimestamps } from '../utils/settings.js';
/**
 * Generic function to convert a DB row to a domain object
 * @param {Object} dbRow - Sequelize row or plain object
 * @param {Object} fieldMap - domainKey -> { db: dbColumn, toDomain?, toDb? }
 */
export function toDomain(dbRow, fieldMap) {
	if (!dbRow) return null;

	const src = dbRow.get ? dbRow.get({ plain: true }) : dbRow;
	const domain = {};

	for (const [domainKey, config] of Object.entries(fieldMap)) {
		let dbKey, transform;

		if (typeof config === 'string') {
			dbKey = config;
			transform = v => v;
		} else {
			dbKey = config.db;
			transform = config.toDomain ?? (v => v);
		}

		const value = src[dbKey];

		if (value === undefined || typeof value === 'function') {
			domain[domainKey] = undefined;
			continue;
		}

		if (dbKey.endsWith('_settings') && Array.isArray(value)) {
			domain[domainKey] = flattenSettings(value);
			domain[domainKey + 'Timestamps'] = flattenSettingsTimestamps(value);
		} else {
			domain[domainKey] = transform(value);
		}
	}

	return domain;
}

/**
 * Generic function to convert a domain object to DB persistence object
 * @param {Object} domainObj
 * @param {Object} fieldMap
 */
export function toPersistence(domainObj, fieldMap) {
	if (!domainObj) return null;
	const dbObj = {};

	for (const [domainKey, config] of Object.entries(fieldMap)) {
		if (!(domainKey in domainObj)) continue; // skip missing fields

		let dbKey, transform;
		if (typeof config === 'string') {
			dbKey = config;
			transform = v => v;
		} else {
			dbKey = config.db;
			transform = config.toDb ?? (v => v);
		}

		// settings tables are handled separately, skip here
		if (dbKey.endsWith('_settings')) continue;

		const value = transform(domainObj[domainKey]);

		// read-only / DB-owned fields
		if (value === undefined) continue;

		dbObj[dbKey] = value;
	}

	return dbObj;
}
