export function assertPresent(value, name) {
	if (value == null) {
		throw new TypeError(`${name} is required`);
	}
}