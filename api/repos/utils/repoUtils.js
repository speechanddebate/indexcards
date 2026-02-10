//TODO this silently fails on unknown mapping, it should log a warning or something
export function resolveAttributesFromFields(fields, FIELD_MAP) {
	// Default: all fields
	if (!fields) return undefined;

	// Include mode
	if (Array.isArray(fields)) {
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
