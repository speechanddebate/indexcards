
import sessionRepo from './sessionRepo.js';
import db from '../data/db.js';
import factories from '../../tests/factories/index.js';

const { personId }  = await factories.person.createTestPerson();

describe('sessionRepo', () => {

	describe('buildSessionQuery', () => {

		it('includes a person record always', async () => {
			//Arrange
			const { sessionId } = await factories.session.createTestSession({ personId });
			//Act
			const session = await sessionRepo.getSession(sessionId, { include: { person: true} });
			//Assert
			expect(session).not.toBeNull();
			expect(session.Person).toBeDefined();
		});

		it('includes su when requested', async () => {
			//Arrange
			const { personId: suId }      = await factories.person.createTestPerson();
			const { sessionId } = await factories.session.createTestSession({ suId, personId });

			//Act
			const session = await sessionRepo.getSession(sessionId, { include: { su: true } });
			//Assert
			expect(session).not.toBeNull();
			expect(session.Su).toBeDefined();
		});
	});

	describe('getSession', () => {
		it('returns null when session does not exist', async () => {
			const session = await sessionRepo.getSession(999999);
			expect(session).toBeNull();
		});
		it('returns the session when it exists', async () => {
			const { sessionId } = await factories.session.createTestSession({personId});
			const session = await sessionRepo.getSession(sessionId);
			expect(session).not.toBeNull();
			expect(session.id).toBe(sessionId);
		});
		it('throws when id is not provided', async () => {
			await expect(sessionRepo.getSession()).rejects.toThrow();
		});
	});

	describe('findByUserKey', () => {

		it('returns null when session does not exist', async () => {
			const session = await sessionRepo.findByUserKey('nonexistentkey');
			expect(session).toBeNull();
		});

		it('returns the session when it exists', async () => {
			const { sessionId, userkey } = await factories.session.createTestSession({personId});
			const session = await sessionRepo.findByUserKey(userkey);
			expect(session).not.toBeNull();
			expect(session.id).toBe(sessionId);
		});
	});

	describe('deleteSession', () => {
		it('deletes the session when given a valid session id', async () => {
			const { sessionId } = await factories.session.createTestSession({personId});

			await sessionRepo.deleteSession(sessionId);

			const deleted = await sessionRepo.getSession(sessionId);
			expect(deleted).toBeNull();
		});

		it('does not call destroy when session id is null', async () => {
			const { sessionId } = await factories.session.createTestSession({personId});
			const destroySpy = vi.spyOn(db.session, 'destroy');

			await sessionRepo.deleteSession(null);

			expect(destroySpy).not.toHaveBeenCalled();

			const stillThere = await sessionRepo.getSession(sessionId);
			expect(stillThere).not.toBeNull();
		});

		it('does not call destroy when session id is undefined', async () => {
			const { sessionId } = await factories.session.createTestSession({personId});
			const destroySpy = vi.spyOn(db.session, 'destroy');

			await sessionRepo.deleteSession(undefined);

			expect(destroySpy).not.toHaveBeenCalled();

			const stillThere = await sessionRepo.getSession(sessionId);
			expect(stillThere).not.toBeNull();
		});

		it('throws when session id is not a number', async () => {
			const { sessionId } = await factories.session.createTestSession({personId});
			await expect(
				sessionRepo.deleteSession('not-a-number'),
			).rejects.toThrow();

			const stillThere = await sessionRepo.getSession(sessionId);
			expect(stillThere).not.toBeNull();
		});
	});

	describe('createSession', () => {
		it('creates a session and returns mapped session with userkey', async () => {
			const { id, userkey } = await sessionRepo.createSession({ personId });

			expect(id).toBeDefined();
			expect(userkey).toBeDefined();
			expect(typeof userkey).toBe('string');
			const sessionInDb = await sessionRepo.getSession(id);
			expect(sessionInDb).not.toBeNull();
			expect(sessionInDb.personId).toBe(personId);
		});

		it('generates a unique userkey for each session', async () => {
			const session1 = await sessionRepo.createSession({ personId });
			const session2 = await sessionRepo.createSession({ personId });
			expect(session1.userkey).not.toBe(session2.userkey);
		});
	});
});
