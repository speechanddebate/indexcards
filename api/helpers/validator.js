import { ValidationError } from './errors/errors.js';

function present(value) {
	return !(value === undefined || value === null);
}
function validDate(value) {
	return !isNaN(Date.parse(value));
}

const check = {
	present,
	validDate,
};

function buildAssertFromChecks(checks) {
	return new Proxy(checks, {
		get(target, prop) {
			if (!(prop in target)) return undefined;
			return (...args) => {
				let msg;
				if (args.length && typeof args[args.length - 1] === 'string') {
					msg = args.pop();
				}
				const result = target[prop](...args);
				if (!result) {
					throw new ValidationError(msg || `${prop} failed`);
				}
				return true;
			};
		},
	});
}

const assert = buildAssertFromChecks(check);

export { assert, check };
