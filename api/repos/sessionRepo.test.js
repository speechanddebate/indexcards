import { describe, it, expect, beforeEach } from "vitest";
import sessionRepo from "./sessionRepo.js";
import db from "../data/db.js";
import factories from '../../tests/factories/index.js';

describe('deleteSession', () => {
    it('deletes the session when given a valid session id', async () => {
		const { sessionId } = await factories.session.createTestSession();
  
    	await sessionRepo.deleteSession(sessionId);
  
		const deleted = await sessionRepo.getSession(sessionId);
		expect(deleted).toBeNull();
    });
  
    it('does not call destroy when session id is null', async () => {
      const { sessionId } = await factories.session.createTestSession();
      const destroySpy = vi.spyOn(db.session, 'destroy');
  
      await sessionRepo.deleteSession(null);
  
      expect(destroySpy).not.toHaveBeenCalled();
  
      const stillThere = await sessionRepo.getSession(sessionId);
      expect(stillThere).not.toBeNull();
    });
  
    it('does not call destroy when session id is undefined', async () => {
      const { sessionId } = await factories.session.createTestSession();
      const destroySpy = vi.spyOn(db.session, 'destroy');
  
      await sessionRepo.deleteSession(undefined);
  
      expect(destroySpy).not.toHaveBeenCalled();
  
      const stillThere = await sessionRepo.getSession(sessionId);
      expect(stillThere).not.toBeNull();
    });
  
    it('throws when session id is not a number', async () => {
      const { sessionId } = await factories.session.createTestSession();
  
      await expect(
        sessionRepo.deleteSession('not-a-number'),
      ).rejects.toThrow();
  
      const stillThere = await sessionRepo.getSession(sessionId);
      expect(stillThere).not.toBeNull();
    });
  });  
  describe('createSession', () => {
    it('creates a session and returns mapped session with userkey', async () => {
		const { personId } = await factories.person.createTestPerson();

        const { id, userkey } = await sessionRepo.createSession({ personId });
        expect(id).toBeDefined();
        expect(userkey).toBeDefined();
        expect(typeof userkey).toBe('string');
        const sessionInDb = await sessionRepo.getSession(id);
        expect(sessionInDb).not.toBeNull();
        expect(sessionInDb.personId).toBe(personId);
    });

    it('generates a unique userkey for each session', async () => {
        const { personId } = await factories.person.createTestPerson();

        const session1 = await sessionRepo.createSession({ personId });
        const session2 = await sessionRepo.createSession({ personId });
        expect(session1.userkey).not.toBe(session2.userkey);
    });
});