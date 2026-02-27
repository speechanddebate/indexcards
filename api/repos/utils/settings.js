
export async function saveSettings({
	model,
	settings,
	ownerKey,
	ownerId,
}) {
	if (!settings || !Object.keys(settings).length) {
		return;
	}

	const rows = buildSettingsRows({
		settings,
		ownerKey,
		ownerId,
	});

	if (!rows.length) {
		return;
	}

	const createdRows =await model.bulkCreate(rows, {
		updateOnDuplicate : [
			'value',
			'value_text',
			'value_date',
		],
	});
	return createdRows;
}

/**
 * Build a Sequelize include for settings based on requested settings tags
 */
export function withSettingsInclude({
	model,
	as,
	settings,
}) {
	// no settings requested => no include
	if (!settings) return [];

	const include = {
		model,
		as,
		required: false,
	};

	// true = include all settings
	if (settings === true) {
		return [include];
	}

	// array = include only specific tags
	if (Array.isArray(settings)) {
		include.where = {
			tag: settings,
		};
		return [include];
	}

	throw new Error(
		`settings must be true or an array of tags`
	);
}

/**
 * Build rows for bulk upsert into a *_setting table
 *
 * @param {Object} params.settings - { tag: value }
 * @param {string} params.ownerKey - column name (e.g. 'school')
 * @param {number} params.ownerId
 * @param {number|null} params.chapter
 *
 * @returns {Array<Object>} rows suitable for bulkCreate
 */
export function buildSettingsRows({
	settings,
	ownerKey,
	ownerId,
}) {
	if (!settings || typeof settings !== 'object') return [];

	return Object.entries(settings).map(([tag, value]) => ({
		[ownerKey]: ownerId,
		tag,
		...encodeSettingValue(value),
	}));
}
/**
 * converts setting rows from DB into a simple key-value object
 * @param {Array} settingRows - rows from DB
 * @returns {Object} settings key-value pairs
 */
export function flattenSettings(settingRows) {
	if (!settingRows) return;

	const out = {};

	for (const s of settingRows) {
		const setting = s.dataValues || s;

		if (setting.value === 'text' || setting.value === 'json') {
			out[setting.tag] = setting.value_text;
			continue;
		}

		if (setting.value === 'date') {
			out[setting.tag] = setting.value_date;
			continue;
		}

		// default column: try number, fall back to string
		if (setting.value !== null && setting.value !== undefined) {
			const num = Number(setting.value);
			out[setting.tag] = Number.isNaN(num)
				? setting.value
				: num;
		} else {
			out[setting.tag] = setting.value;
		}
	}

	return out;
}
/**
 * Converts setting rows from DB into an object mapping tag to { createdAt, updatedAt }
 * @param {Array} settingRows - rows from DB
 * @returns {Object} { tag: { createdAt, updatedAt }, ... }
 */
export function flattenSettingsTimestamps(settingRows) {
	if (!settingRows) return;

	const out = {};

	for (const s of settingRows) {
		const setting = s.dataValues || s;
		out[setting.tag] = {
			createdAt: setting.created_at,
			updatedAt: setting.timestamp,
		};
	}

	return out;
}

/**
 *  converts a setting value into appropriate DB fields
 * @param {*} value  - the setting value
 * @returns an object with keys: value, value_text, value_date
 */
function encodeSettingValue(value) {
	// null / undefined -> clear all value fields
	if (value === null || value === undefined) {
		return {
			value: null,
			value_text: null,
			value_date: null,
		};
	}

	// Date → value_date
	if (value instanceof Date) {
		return {
			value: null,
			value_text: null,
			value_date: value,
		};
	}

	// Boolean → string
	if (typeof value === 'boolean') {
		return {
			value: value ? '1' : '0',
			value_text: null,
			value_date: null,
		};
	}

	// Number → string
	if (typeof value === 'number') {
		return {
			value: String(value),
			value_text: null,
			value_date: null,
		};
	}

	// String → value or value_text
	if (typeof value === 'string') {
		if (value.length <= 64) {
			return {
				value,
				value_text: null,
				value_date: null,
			};
		}

		return {
			value: null,
			value_text: value,
			value_date: null,
		};
	}

	// Object / Array → JSON in value_text
	return {
		value: null,
		value_text: JSON.stringify(value),
		value_date: null,
	};
}
