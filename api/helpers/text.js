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

export const lcfirst = (lowered) => {
	return String(lowered).charAt(0).toLowerCase() + String(lowered).slice(1);
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
	if (!snaked || !snaked.toLowerCase) return;
	return snaked.toLowerCase()
		.replace(/([-_][a-z])/g, (group) => {
			return group.toUpperCase().replace('-', '').replace('_', '');
		});
};

export const dbToObject = (object, tag, options = {}) => {
	const newObject = {};
	const oldObject = { ...object };

	Object.keys(oldObject).forEach( (key) => {
		if (key.includes(tag)) {
			const newTag = lcfirst(key.replace(tag, ''));
			newObject[newTag] = oldObject[key];
			delete oldObject[key];
		}
	});

	oldObject[ucfirst(tag)] = newObject;
	if (!options.keepNulls) oldObject[ucfirst(tag)] = stripNulls(newObject);
	return oldObject;
};

export const stripNulls = (target, exclude = []) => {
	const returnObject = { ...target };
	Object.keys(returnObject).forEach( (key) => {
		if (
			!exclude.includes[key]
			&& !returnObject[key] || returnObject[key] === 'null'
		) {
			delete returnObject[key];
		}
	});
	return returnObject;
};

export default addZero;
