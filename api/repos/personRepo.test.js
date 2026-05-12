
import factories from '../../tests/factories/index.js';
import personRepo, { personInclude } from './personRepo.js';
import { expect } from 'chai';
import db from '../data/db.js';

//kinda hate this but it allows us to test the paradigm cutoff logic without having to mock out the entire settings system or
// manipulate time in a way that could affect other tests. will eventually want to setup more robust settings testing
async function setTabroomDateSetting(tag, valueDate) {
	const [setting] = await db.tabroomSetting.findOrCreate({
		where: { tag },
		defaults: {
			tag,
			value: 'date',
			value_date: valueDate,
		},
	});

	await setting.update({
		value: 'date',
		value_date: valueDate,
	});
}

async function getTabroomDateSettingSnapshot(tag) {
	const row = await db.tabroomSetting.findOne({ where: { tag } });
	if (!row) return null;

	return {
		id: row.id,
		tag: row.tag,
		value: row.value,
		value_text: row.value_text,
		value_date: row.value_date,
		person: row.person,
	};
}

async function restoreTabroomDateSetting(tag, snapshot) {
	if (!snapshot) {
		await db.tabroomSetting.destroy({ where: { tag } });
		return;
	}

	await db.tabroomSetting.update(
		{
			value: snapshot.value,
			value_text: snapshot.value_text,
			value_date: snapshot.value_date,
			person: snapshot.person,
		},
		{ where: { id: snapshot.id } }
	);
}

describe('PersonRepo', () => {
	describe('hasValidParadigm with auto cutoff discovery', () => {
		let cutoffSnapshot;
		let startSnapshot;

		beforeEach(async () => {
			cutoffSnapshot = await getTabroomDateSettingSnapshot('paradigm_review_cutoff');
			startSnapshot = await getTabroomDateSettingSnapshot('paradigm_review_start');
		});

		afterEach(async () => {
			await restoreTabroomDateSetting('paradigm_review_cutoff', cutoffSnapshot);
			await restoreTabroomDateSetting('paradigm_review_start', startSnapshot);
		});

		it('includes paradigm when cutoff is not active yet', async () => {
			const now = new Date();
			const reviewStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
			const cutoffInFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000);

			await setTabroomDateSetting('paradigm_review_start', reviewStart);
			await setTabroomDateSetting('paradigm_review_cutoff', cutoffInFuture);

			const { personId } = await factories.person.createTestPerson({
				settings: {
					paradigm: 'Legacy paradigm text',
				},
			});

			const staleTimestamp = new Date(reviewStart.getTime() - 24 * 60 * 60 * 1000);
			await db.personSetting.update(
				{ timestamp: staleTimestamp },
				{ where: { person: personId, tag: 'paradigm' } }
			);

			const person = await personRepo.getPerson(personId, { hasValidParadigm: true });

			expect(person).toBeDefined();
			expect(person.id).toBe(personId);
		});

		it('excludes paradigm older than review start once cutoff is active', async () => {
			const now = new Date();
			const reviewStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
			const cutoffInPast = new Date(now.getTime() - 24 * 60 * 60 * 1000);

			await setTabroomDateSetting('paradigm_review_start', reviewStart);
			await setTabroomDateSetting('paradigm_review_cutoff', cutoffInPast);

			const { personId } = await factories.person.createTestPerson({
				settings: {
					paradigm: 'Stale paradigm text',
				},
			});

			const staleTimestamp = new Date(reviewStart.getTime() - 24 * 60 * 60 * 1000);
			await db.personSetting.update(
				{ timestamp: staleTimestamp },
				{ where: { person: personId, tag: 'paradigm' } }
			);

			const person = await personRepo.getPerson(personId, { hasValidParadigm: true });

			expect(person).toBeNull();
		});

		it('includes paradigm newer than review start once cutoff is active', async () => {
			const now = new Date();
			const reviewStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
			const cutoffInPast = new Date(now.getTime() - 24 * 60 * 60 * 1000);

			await setTabroomDateSetting('paradigm_review_start', reviewStart);
			await setTabroomDateSetting('paradigm_review_cutoff', cutoffInPast);

			const { personId } = await factories.person.createTestPerson({
				settings: {
					paradigm: 'Fresh paradigm text',
				},
			});

			const freshTimestamp = new Date(reviewStart.getTime() + 60 * 1000);
			await db.personSetting.update(
				{ timestamp: freshTimestamp },
				{ where: { person: personId, tag: 'paradigm' } }
			);

			const person = await personRepo.getPerson(personId, { hasValidParadigm: true });

			expect(person).toBeDefined();
			expect(person.id).toBe(personId);
		});
	});

	describe('buildPersonQuery', () => {

		it('excludes password by default', async () => {

			// Arrange
			const { personId } = await factories.person.createTestPerson();

			// Act
			const person = await personRepo.getPerson(personId);

			// Assert
			expect(person).toBeDefined();
			expect(person.password).toBeUndefined();
		});

		it('includes password when requested via fields', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson();

			// Act
			const person = await personRepo.getPerson(personId, { fields: ['password'] });

			// Assert
			expect(person).toBeDefined();
			expect(person.password).toBeDefined();
		});

		it('excludes password even when other fields are excluded', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson();

			// Act
			const person = await personRepo.getPerson(personId, { fields: { exclude: ['firstName', 'lastName'] } });

			// Assert
			expect(person).toBeDefined();
			expect(person.password).toBeUndefined();
			expect(person.firstName).toBeUndefined();
			expect(person.lastName).toBeUndefined();
		});

		it('includes password when requested', async () => {
			// Arrange
			const password = 'test password';
			const { personId } = await factories.person.createTestPerson({ password });

			// Act
			const person = await personRepo.getPerson(personId, { includePassword: true });

			// Assert
			expect(person).toBeDefined();
			expect(person.password).toBeDefined();
			expect(person.password).toBe(password);
		});
		it('excludes banned persons when excludeBanned is true', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson({
				settings: {
					banned: '1',
				},
			});

			// Act
			const person = await personRepo.getPerson(personId, { excludeBanned: true });

			// Assert
			expect(person).toBeNull();
		});

		it('excludes persons with unconfirmed emails when excludeUnconfirmedEmail is true', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson({
				settings: {
					email_unconfirmed: '1',
				},
			});
			// Act
			const person = await personRepo.getPerson(personId, { excludeUnconfirmedEmail: true });

			// Assert
			expect(person).toBeNull();
		});
		it('paradigm search filters', async () => {
			//set the cutoff to the future
			//await db.tabroomSetting.delete( tag: 'paradigm_review_cutoff', value: 'date');
			// Arrange
			// Create person with paradigm setting timestamp between review start and cutoff
			const { personId } = await factories.person.createTestPerson({
				settings: {
					paradigm: 'Some paradigm',
				},
			});
			await factories.judge.createTestJudge({
				person: personId,
			});
			// Act
			const person = await personRepo.getPerson(personId, {
				excludeBanned: true,
				excludeUnconfirmedEmail: true,
				hasValidParadigm: true,
				include: {
					Judges: {
						fields: ['id'],
						include: {
							School: {
								fields: ['id','name'],
							},
						},
					},
				},
			});

			// Assert
			expect(person).toBeDefined();
			expect(person.id).toBe(personId);
			expect(person.Judges).toBeDefined();
			expect(Array.isArray(person.Judges)).toBe(true);
			expect(person.Judges.length).toBeGreaterThan(0);
		});
		it('attaches PersonQuizzes when include.PersonQuizzes is true', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson();
			const { quizId } = await factories.quiz.createTestQuiz({ person: personId });
			await factories.personQuiz.createTestPersonQuiz({
				person: personId,
				quiz: quizId,
				hidden: false,
				pending: false,
				completed: true,
				approvedBy: null,
			});
			// Act
			const person = await personRepo.getPerson(personId, {
				include: {
					PersonQuizzes: true,
				},
			});

			// Assert
			expect(person).toBeDefined();
			expect(person.PersonQuizzes).toBeDefined();
			expect(Array.isArray(person.PersonQuizzes)).toBe(true);
			expect(person.PersonQuizzes.length).toBeGreaterThan(0);
			expect(person.PersonQuizzes[0]).toBeDefined();

		});
		describe('filters by hasValidParadigm', () => {
			it('excludes persons without a paradigm setting', async () => {
				// Arrange
				const { personId } = await factories.person.createTestPerson();
				// Act
				const person = await personRepo.getPerson(personId, { hasValidParadigm: true });
				// Assert
				expect(person).toBeNull();
			});
		});
	});

	describe('personInclude', () => {
		it('returns base person include config', async () => {
			const inc = await personInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});

	describe('getPerson', () => {
		it('returns the person when the id is valid', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson();
			// Act
			const result = await personRepo.getPerson(personId);
			// Assert
			expect(result).not.toBeNull();
			expect(result.id).toBe(personId);
		});
		it('returns null when the id is invalid', async () => {
			// Act
			const result = await personRepo.getPerson(999999);
			// Assert
			expect(result).toBeNull();
		});
	});

	describe('personSearch', () => {
		it('returns persons matching the search query', async () => {
			// Arrange
			const personData = factories.person.createPersonData();
			const { personId } = await factories.person.createTestPerson(personData);
			//person must have judged at least once to be included in search results
			await factories.judge.createTestJudge({ person: personId });

			// Act
			const results = await personRepo.personSearch(`${personData.firstName} ${personData.lastName}`);

			// Assert: expect the search results to include the created person
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].id).toBe(personId);
		});
		it('returns an empty array when no persons match the search query', async () => {
			// Arrange
			const personData = factories.person.createPersonData();
			await factories.person.createTestPerson(personData);

			// Act
			const results = await personRepo.personSearch('Nonexistent Name');

			// Assert
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBe(0);
		});
		it('returns results when search query is empty', async () => {
			// Arrange
			const personData = factories.person.createPersonData();
			await factories.person.createTestPerson(personData);

			// Act
			const results = await personRepo.personSearch();

			// Assert
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);
		});
	});

	describe('getPersonByUsername', () => {
		it('returns the person when the username is valid', async () => {
			// Arrange
			const { personId, getPerson } = await factories.person.createTestPerson();
			const person = await getPerson();

			// Act
			const result = await personRepo.getPersonByUsername(person.email);

			// Assert
			expect(result).not.toBeNull();
			expect(result.id).toBe(personId);
		});
	});

	describe('createPerson', () => {
		it('creates a person and returns the new id', async () => {
			// Arrange
			const personData = factories.person.createPersonData();
			// Act
			const newPersonId = await personRepo.createPerson(personData);
			// Assert
			expect(newPersonId).toBeDefined();
			const person = await personRepo.getPerson(newPersonId);
			expect(person).not.toBeNull();
			// Compare fields except id and timestamps
			for (const key of Object.keys(personData)) {
				expect(person[key]).toEqual(personData[key]);
			}
		});
	});
});
