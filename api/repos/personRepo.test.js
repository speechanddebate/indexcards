import factories from '../../tests/factories/index.js';
import personRepo, { personInclude } from './personRepo.js';

describe('PersonRepo', () => {
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
			// Act
			const person = await personRepo.getPerson(personId, {
				excludeBanned: true,
				excludeUnconfirmedEmail: true,
				hasValidParadigm: true,
				include: {
					Judges: {
						fields: ['id'],
						include: {
							school: {
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

	describe('hasAreaAccess', () => {

		it('returns true when person has access', async () => {

			// Arrange
			const { personId } = await factories.person.createTestPerson({
				settings: {
					api_auth_caselist: '1',
				},
			});

			// Act
			const result = await personRepo.hasAreaAccess(personId, 'caselist');

			// Assert
			expect(result).toBe(true);
		});

		it('returns false when person does not have access', async () => {
			// Arrange
			const { personId } = await factories.person.createTestPerson();

			// Act
			const result = await personRepo.hasAreaAccess(personId, 'caselist');

			// Assert
			expect(result).toBe(false);
		});
	});
});
