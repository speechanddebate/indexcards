import logger from './logger.js';
export function safeParseJson(str) {
	try {
		return JSON.parse(str);
	} catch (err) {
		logger.error(
			`Failed to parse JSON for Value: ${str}. Error: ${err}`
		);
		return {};
	}
}