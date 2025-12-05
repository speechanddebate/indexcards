import { errorLogger } from './logger.js';
export function safeParseJson(str) {
	try {
		return JSON.parse(str);
	} catch (err) {
		errorLogger.info(
			`Failed to parse JSON for Value: ${str}. Error: ${err}`
		);
		return {};
	}
}