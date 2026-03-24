
import * as buildTargetModule from './buildTarget.js';
import { loadExtAuthContext, loadTournAuthContext } from './authContext.js';
import {requireAreaAccess, requireSiteAdmin, requireAccess, checkAccess, createActor} from './authorization.js';
import { createContext } from '../../../tests/httpMocks.js';

describe('Authorization Middleware', () => {
	describe('requireAreaAccess', () => {
		it('deny access when no actor', async () => {
			// Arrange
			const {req, res, next} = createContext();
			// Act
			await loadExtAuthContext(req, res, () => {});
			await requireAreaAccess(req, res, next);
			// Assert

			expect(res.status).toHaveBeenCalledWith(401);
			expect(next).not.toHaveBeenCalled();
		});
		it('deny access when no area access', async () => {
			// Arrange
			const {req, res, next} = createContext({
				req: {
					person: {id: 1},
					params: {area: 'caselist'},
				},
			});
			req.actor = createActor(req);
			await loadExtAuthContext(req, res, () => {});

			vi.spyOn(buildTargetModule, 'buildTarget').mockResolvedValueOnce({ id: 2, resource: 'api_auth_caselist' });

			// Act
			await requireAreaAccess(req, res, next);

			// Assert
			expect(res.status).toHaveBeenCalledWith(403);
			expect(next).not.toHaveBeenCalled();
		});
		it('allow access when has area access', async () => {
			// Arrange
			const {req, res, next} = createContext({
				req: {
					person: {id: 1},
					params: {area: 'caselist'},
				},
			});
			req.actor = createActor(req);
			await loadExtAuthContext(req, res, () => {});
			vi.spyOn(buildTargetModule, 'buildTarget').mockResolvedValueOnce({ id: 1, resource: 'api_auth_caselist' });

			// Act
			await requireAreaAccess(req, res, next);

			// Assert
			expect(next).toHaveBeenCalled();
		});
	});
	describe('requireSiteAdmin', () => {
		it('deny when unauthenticated', () => {
			const {req, res, next} = createContext();

			requireSiteAdmin(req,res,next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(next).not.toHaveBeenCalled();
		});
		it('deny when not siteAdmin', () => {
			const {req, res, next} = createContext({
				req: {
					person: {
						siteAdmin: false,
					},
				},
			});
			req.actor = createActor(req);

			requireSiteAdmin(req,res,next);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(next).not.toHaveBeenCalled();
		});
		it('allow when siteAdmin', () => {
			const {req, res, next} = createContext({
				req: {
					person: {
						siteAdmin: true,
					},
				},
			});
			req.actor = createActor(req);
			requireSiteAdmin(req,res,next);

			expect(next).toHaveBeenCalled();
		});

	});

	describe('requireAccess', () => {

		beforeEach(() => {
			vi.restoreAllMocks();
		});

		const resources = ['tourn','category','event','jpool','judge','round','rpool','entry','site','room'];
		const capabilities = ['read','write','owner'];

		const cases = resources.flatMap(resource =>
			capabilities.map(cap => [resource, cap])
		);

		it.each(cases)('denies access for %s:%s when not authenticated',async (resource, capability) => {
			vi.spyOn(buildTargetModule, 'buildTarget').mockResolvedValueOnce({ id: 42, resource, circuitIds: []});
			const { req, res, next } = createContext({
				req: {
					params: { [`${resource}Id`]: 42 },
				},
			});

			await loadTournAuthContext(req, res, () => {});
			await requireAccess(resource, capability)(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(next).not.toHaveBeenCalled();
		});

		it.each(cases)('allows siteAdmin to bypass checks for %s:%s',async (resource, capability) => {
			vi.spyOn(buildTargetModule, 'buildTarget').mockResolvedValueOnce({ id: 42, resource, circuitIds: []});
			const {req,res,next} = createContext({
				req: {
					person: { id: 1, siteAdmin: true },
					params: { tournId: 1 },
					auth: { perms: [] },
				},
			});
			req.actor = createActor(req);
			await loadTournAuthContext(req, res, () => {});
			await requireAccess(resource, capability)(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it.each(cases)('Allows owner all capabilities for %s',async (resource) => {
			vi.spyOn(buildTargetModule, 'buildTarget').mockResolvedValueOnce({ id: 42, resource, circuitIds: []});
			const {req,res,next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { [`${resource}Id`]: 42 },
					auth: {
						perms: [
							{ scope: resource, id: 42, role: 'owner' },
						],
					},
				}});
			req.actor = createActor(req);

			await loadTournAuthContext(req, res, () => {});

			for (const capability of capabilities) {
				await requireAccess(resource, capability)(req, res, next);
				expect(next).toHaveBeenCalled();
				next.mockClear();
			}
		});

		it('allows access with correct permission and capability', async () => {
			const {req,res,next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42 },
					auth: {
						perms: [
							{ scope: 'tourn', id: 42, role: 'owner' },
						],
					},
				}});
			req.actor = createActor(req);
			await loadTournAuthContext(req, res, () => {});
			await requireAccess('tourn', 'read')(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('denies access if permission does not match resource id', async () => {
			let {req, res, next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42 },
					auth: {
						perms: [
							{ scope: 'tourn', id: 99, role: 'owner' },
						],
					},
				},
			});
			req.actor = createActor(req);
			await loadTournAuthContext(req, res, () => {});
			await requireAccess('tourn', 'read')(req, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(403);
		});

		it('allows access if parent scope grants capability', async () => {
			vi.spyOn(buildTargetModule, 'buildTarget').mockResolvedValueOnce({ id: 7, resource: 'category', tournId: 42, circuitIds: []});
			const {req, res, next} = createContext({
				req: { person: { id: 1, siteAdmin: false },
					params: { tournId: 42, categoryId: 7 },
					auth: {
						perms: [
							{ scope: 'tourn', id: 42, role: 'owner' },
						],
					},
				},
			});
			req.actor = createActor(req);
			await loadTournAuthContext(req, res, () => {});
			await requireAccess('category', 'read')(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('denies access if role does not grant capability', async () => {
			let {req, res, next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42 },
					auth: {
						perms: [
							{ scope: 'tourn', id: 42, role: 'tabber' },
						],
					},
				}});
			req.actor = createActor(req);
			await loadTournAuthContext(req, res, () => {});
			await requireAccess('tourn', 'owner')(req, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.json).toHaveBeenCalled();
		});

		it('allows access for child resource with parent permission', async () => {
			let {req, res, next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42, categoryId: 7 },
					auth: {
						perms: [
							{ scope: 'tourn', id: 42, role: 'owner' },
						],
					},
				}});
			req.actor = createActor(req);
			vi.spyOn(buildTargetModule, 'buildTarget').mockResolvedValueOnce({ id: 42, resource: 'category', tournId: 42});

			await loadTournAuthContext(req, res, () => {});

			await requireAccess('category', 'write')(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('denies access if no matching permission', async () => {
			const {req, res, next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42 },
					auth: {
						perms: [
							{ scope: 'event', id: 99, role: 'owner' },
						],
					},
				}});
			await loadTournAuthContext(req, res, () => {});
			await requireAccess('tourn', 'read')(req, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.json).toHaveBeenCalled();
		});
	});
	describe('checkAccess', () => {
		it('allows tourn owner tourn access', async () => {
			const perm = { scope: 'tourn', id: 42, role: 'owner' };
			const granted = checkAccess('tourn', 'read', {id: 42}, [perm]);
			expect(granted).toBe(true);
		});
		it('allows tourn owner event access', async () => {
			const perm = { scope: 'tourn', id: 42, role: 'owner' };
			const granted = checkAccess('event', 'read', {id: 12, tournId: 42}, [perm]);
			expect(granted).toBe(true);
		});
		it('denies event access when owner of other tourn', async () => {
			const perm = { scope: 'tourn', id: 42, role: 'owner' };
			const granted = checkAccess('event', 'read', {id: 12, tournId: 43}, [perm]);
			expect(granted).toBe(false);
		});
		it('allows access when one perm allows access', async () => {
			const perms = [
				{ scope: 'tourn', id: 42, role: 'owner' },
				{ scope: 'event', id: 12, role: 'owner' },
			];
			const granted = checkAccess('event', 'write', {id: 12, tournId: 44}, perms);
			expect(granted).toBe(true);
		});
		it('denies access when perm with the same id but different scope', async () => {
			const perm = { scope: 'event', id: 12, role: 'owner' };
			const granted = checkAccess('tourn', 'read', {id: 12}, [perm]);
			expect(granted).toBe(false);
		});
		it('allows tourn owner access to category in tourn', async () => {
			const perm = { scope: 'tourn', id: 42, role: 'owner' };
			const granted = checkAccess('category', 'write', {id: 7, tournId: 42}, [perm]);
			expect(granted).toBe(true);
		});
		it('allow event tabber access to timeslot:read', async () => {
			const perm = { scope: 'event', id: 12,tournId: 42, role: 'tabber' };
			const granted = checkAccess('timeslot', 'read', {id: 5, eventId: 12, tournId: 42}, [perm]);
			expect(granted).toBe(true);
		});
	});
});