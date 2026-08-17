import personRepo from '../../api/repos/personRepo.js';
import { faker } from '@faker-js/faker';
import factories from './index.js';

export function createPersonData(overrides = {}) {
	// Ensure email is always unique by adding a random string
	const uniqueEmail = `user_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@example.com`;
	return {
		email: uniqueEmail,
		first: faker.person.firstName(),
		middle: faker.datatype.boolean() ? faker.person.middleName() : null,
		last: faker.person.lastName(),
		state: faker.location.state({ abbreviated: true }),
		country: faker.location.countryCode(),
		tz: faker.location.timeZone(),
		...overrides,
	};
}

export async function create(overrides = {}) {
	delete overrides.Judge;
	const data = createPersonData({
		...overrides,
	});

	const personId = await personRepo.createPerson(data);

	return {
		personId,
		getPerson: () => personRepo.getPerson(personId, { settings: true }),
	};
}
export async function createJudge(overrides = {}) {
	const data = createPersonData({
		...overrides,
	});
	const personId = overrides.personId ?? await personRepo.createPerson(data);
	const { judgeId } = await factories.judge.createTestJudge({ person: personId, ...overrides.Judge });

	return {
		personId,
		getPerson: () => personRepo.getPerson(personId),
		judgeId,
	};
}

//create a current ballot for a person
export async function createBallot(overrides = {}) {
	let personId, judgeId;

	const tourn = await factories.tourn.createFull(overrides);
	({ personId, judgeId } = await factories.person.createJudge({
		personId: overrides.personId,
		Judge: { category: tourn.categoryId },
	}));

	const { sectionId } = await factories.section.create({
		round: tourn.roundId,
	});

	const { entryId: entry1 } = await factories.entry.createTestEntry();
	const { entryId: entry2 } = await factories.entry.createTestEntry();
	await factories.ballot.create({
		speakerorder: 0,
		judge: judgeId,
		entry: entry1,
		section: sectionId,
	});
	await factories.ballot.create({
		speakerorder: 1,
		judge: judgeId,
		entry: entry2,
		section: sectionId,
		...overrides.Ballot,
	});
	return {
		tournId: tourn.tournId,
		personId,
		judgeId,
	};
}

export default {
	create,
	createPersonData,
	createJudge,
	createBallot,
};
