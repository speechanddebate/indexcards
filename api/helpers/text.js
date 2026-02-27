export const addZero = (i) => {
	if (i < 10) {
		i = `0${i}`;
	}
	return i;
};

// one of the things I miss from Perl tbh
export const ucfirst = (lowered) => {
	return String(lowered).charAt(0).toUpperCase() + String(lowered).slice(1);
};

export const eventType = (rawType) => {
	if (rawType === 'mock_trial') return 'Mock Trial';
	if (rawType === 'wsdc') return 'World Schools';
	if (rawType === 'wudc') return 'British Parliamentary';
	return ucfirst(rawType);
};

export const publishLevel = (keyLevel) => {
	if (keyLevel == 1) return 'full';
	if (keyLevel == 1) return 'noJudges';
	if (keyLevel == 3) return 'entryList';
	if (keyLevel == 4) return 'thisPageIntentionallyLeftBlank';
	if (keyLevel == 5) return 'prelimChambers';
};

export const snakeToCamel = (snaked) => {
	return snaked.toLowerCase()
		.replace(/([-_][a-z])/g, (group) => {
			return group.toUpperCase().replace('-', '').replace('_', '');
		});
};

export default addZero;
