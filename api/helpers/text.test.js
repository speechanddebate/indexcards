import * as textHelper from './text.js';

describe('profanityCheck', () => {
	it('should return an empty array for clean text', () => {
		expect(textHelper.profanityCheck('This is a clean sentence.')).toEqual([]);
	});

	it('should return the list of found profanities for text with profanity', () => {
		expect(textHelper.profanityCheck('This sentence contains shit.')).toEqual(['shit']);
	});
});