import { snakeToCamel } from './text.js';

export const settingsMapper = (rawSettings) => {

	console.log(JSON.stringify(rawSettings, null, 2));

	const settings = rawSettings.map( (es) => {
		const tag = snakeToCamel(es.tag);
		if (es.value === 'text') return  { tag, value : [es.valueText] };
		if (es.value === 'json') return  { tag, value : JSON.parse(es.valueText) };
		if (es.value === 'date') return  { tag, value : new Date(es.valueDate) };
		return { tag, value : es.value };
	}).reduce( (acc, setting) => {
		acc[setting.tag] = setting.value;
		return acc;
	}, {});

	console.log(settings);

	const timestamps = rawSettings.map( (es) => {
		if (!es.timestamp) return {};
		const tag = snakeToCamel(es.tag);
		return { tag, value : new Date(es.timestamp) };
	}).reduce( (acc, setting) => {
		if (setting.value && setting.value !== null) {
			acc[setting.tag] = setting.value;
			return acc;
		}
	}, {});

	return {settings, timestamps};
};