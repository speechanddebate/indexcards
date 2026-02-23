//TODO this silently fails on unknown mapping, it should log a warning or something
export function resolveAttributesFromFields(fields, FIELD_MAP) {
	// Default: all fields
	if (!fields) return undefined;

	// Include mode
	if (Array.isArray(fields)) {
		// Empty array explicitly means: select 0 columns
		if (fields.length === 0) {
			return [];
		}
		return fields
			.map(f => FIELD_MAP[f])
			.filter(Boolean);
	}

	// Exclude mode
	if (typeof fields === 'object' && Array.isArray(fields.exclude)) {
		return {
			exclude: fields.exclude
				.map(f => FIELD_MAP[f])
				.filter(Boolean),
		};
	}

	throw new Error(
		'opts.fields must be an array (include) or { exclude: [...] }'
	);
}

/**
 * Detect whether an error is a foreign-key constraint error and optionally
 * whether it references a specific field or index identifier.
 */
export function isForeignKeyError(err, fkIdentifier) {
	if (!err) return false;

	const isFkErr =
		err instanceof Error &&
		(err.name === 'SequelizeForeignKeyConstraintError' || err.parent?.errno === 1452);

	if (!isFkErr) return false;

	if (!fkIdentifier) return true;

	const fields = err.fields || {};
	const fieldValues = Array.isArray(fields) ? fields : Object.values(fields);

	return (
		fieldValues.includes(fkIdentifier) ||
		(typeof err.index === 'string' && err.index.includes(fkIdentifier))
	);
}
