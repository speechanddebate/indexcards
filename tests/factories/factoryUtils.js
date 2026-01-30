import { faker } from '@faker-js/faker';

const SCHOOLS = [
	'Lincoln',
	'Jefferson',
	'Roosevelt',
	'Washington',
	'Central',
	'Westfield',
	'Northview',
	'Southridge',
];

const TOURN_SUFFIXES = [
	'Invitational',
	'Classic',
	'Open',
	'Championship',
	'Memorial Tournament',
];

const SEASONS = ['Fall', 'Winter', 'Spring'];

export function fakeTournName() {
	const pattern = faker.number.int({ min: 1, max: 4 });

	switch (pattern) {
		case 1:
			return `${faker.helpers.arrayElement(SCHOOLS)} ${faker.helpers.arrayElement(TOURN_SUFFIXES)}`;
		case 2:
			return `${faker.location.city()} ${faker.helpers.arrayElement(TOURN_SUFFIXES)}`;
		case 3:
			return `${faker.helpers.arrayElement(SEASONS)} ${faker.word.noun()} Invitational`;
		default:
			return `${faker.person.lastName()} Memorial Tournament`;
	}
}
export function toWebName(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-') // non-alphanumeric dash
		.replace(/(^-|-$)/g, '');    // trim leading/trailing dashes
}