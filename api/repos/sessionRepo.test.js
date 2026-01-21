import { describe, it, expect, beforeEach } from "vitest";
import sessionRepo from "./sessionRepo.js";
import db from "../data/db.js";
import factories from '../../tests/factories';

describe('deleteSession', () => {
    it('deletes the session when given a valid session id', async () => {
      const session = await factories.session();
  
      await sessionRepo.deleteSession(session.id);
  
      const deleted = await db.session.findByPk(session.id);
      expect(deleted).toBeNull();
    });
  
    it('does not call destroy when session id is null', async () => {
      const session = await factories.session();
      const destroySpy = vi.spyOn(db.session, 'destroy');
  
      await sessionRepo.deleteSession(null);
  
      expect(destroySpy).not.toHaveBeenCalled();
  
      const stillThere = await db.session.findByPk(session.id);
      expect(stillThere).not.toBeNull();
    });
  
    it('does not call destroy when session id is undefined', async () => {
      const session = await factories.session();
      const destroySpy = vi.spyOn(db.session, 'destroy');
  
      await sessionRepo.deleteSession(undefined);
  
      expect(destroySpy).not.toHaveBeenCalled();
  
      const stillThere = await db.session.findByPk(session.id);
      expect(stillThere).not.toBeNull();
    });
  
    it('throws when session id is not a number', async () => {
      const session = await factories.session();
  
      await expect(
        sessionRepo.deleteSession('not-a-number'),
      ).rejects.toThrow();
  
      const stillThere = await db.session.findByPk(session.id);
      expect(stillThere).not.toBeNull();
    });
  });  
  describe('createSession', () => {
    it('creates a session and returns mapped session with userkey', async () => {
        const person = await factories.person();
        const ip = '127.0.0.1';

        const { id, userkey } = await sessionRepo.createSession({ person: person.id, ip });

        expect(id).toBeDefined();
        expect(userkey).toBeDefined();
        expect(typeof userkey).toBe('string');
        const sessionInDb = await db.session.findByPk(id);
        expect(sessionInDb).not.toBeNull();
        expect(sessionInDb.userkey).toBe(userkey);
        expect(sessionInDb.person).toBe(person.id);
        expect(sessionInDb.ip).toBe(ip);
    });

    it('generates a unique userkey for each session', async () => {
        const person = await factories.person();
        const ip = '127.0.0.1';

        const session1 = await sessionRepo.createSession({ personId: person.id, ip });
        const session2 = await sessionRepo.createSession({ personId: person.id, ip });

        expect(session1.userkey).not.toBe(session2.userkey);
    });
});