//TODO this silently fails on unknown mapping, it should log a warning or something
export function resolveAttributesFromFields(fields, FIELD_MAP) {
	if (!Array.isArray(fields)) {
		return undefined; // Not an array: undefined
	}
	if (fields.length === 0) {
		return []; // Empty array: empty array
	}
	return fields
		.map((f) => FIELD_MAP[f])
		.filter(Boolean);
}
