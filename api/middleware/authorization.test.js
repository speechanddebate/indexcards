import { describe } from "vitest";
import personRepo from '../repos/personRepo.js';
import {requireAreaAccess, requireSiteAdmin, requireAccess} from "./authorization.js";
import { createContext } from "../../tests/httpMocks.js";

describe("Authorization Middleware", () => {

    describe("requireAreaAccess", () => {
        it("deny access when no user", async () => {
            // Arrange
            const {req, res, next} = createContext();
            // Act
            await requireAreaAccess(req, res, next);
            // Assert
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
        it("deny access when no area access", async () => {
            // Arrange
            const {req, res, next} = createContext({
                req: {
                    person: {id: 1},
                    params: {area: 'caselist'},
                },
            });

            vi.spyOn(personRepo, 'hasAreaAccess').mockResolvedValueOnce(false);

            // Act
            await requireAreaAccess(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
        it("allow access when has area access", async () => {
            // Arrange
            const {req, res, next} = createContext({
                req: {
                    person: {id: 1},
                    params: {area: 'caselist'},
                },
            });

            vi.spyOn(personRepo, 'hasAreaAccess').mockResolvedValueOnce(true);

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
                        siteAdmin: false
                    }
                }
            });

            requireSiteAdmin(req,res,next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
        it('allow when siteAdmin', () => {
            const {req, res, next} = createContext({
                req: {
                    person: {
                        siteAdmin: true
                    }
                }
            });

            requireSiteAdmin(req,res,next);

            expect(next).toHaveBeenCalled();
        });

    });
	
	describe('requireAccess', () => {

		const resources = ['tourn','category','event','jpool','judge','round','entry','site','room'];
		const capabilities = ['read','write','owner','tabber'];

		const cases = resources.flatMap(resource =>
			capabilities.map(cap => [resource, cap])
		  );
		
		  it.each(cases)(
			'denies access for %s:%s when not authenticated',
			(resource, capability) => {
			  const { req, res, next } = createContext();
		
			  requireAccess(resource, capability)(req, res, next);
		
			  expect(res.status).toHaveBeenCalledWith(401);
			  expect(next).not.toHaveBeenCalled();
			});

		it.each(cases)(
			'allows siteAdmin to bypass checks for %s:%s',
			(resource, capability) => {
			const {req,res,next} = createContext({
				req: {
					person: { id: 1, siteAdmin: true },
					params: { tournId: 1 },
					auth: { perms: [] }
				}
			});
			requireAccess(resource, capability)(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('allows access with correct permission and capability', () => {
			const {req,res,next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42 },
					auth: {
						perms: [
						{ scope: 'tourn', id: 42, role: 'owner' }
					]
				}
			}});
			requireAccess('tourn', 'read')(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('denies access if permission does not match resource id', () => {
			let {req, res, next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42 },
					auth: {
						perms: [
							{ scope: 'tourn', id: 99, role: 'owner' }
						]
					}
				}
			});
			requireAccess('tourn', 'read')(req, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(403);
		});

		it('allows access if parent scope grants capability', () => {
			const {req, res, next} = createContext({
				req: { person: { id: 1, siteAdmin: false },
					params: { tournId: 42, categoryId: 7 },
					auth: {
						perms: [
							{ scope: 'tourn', id: 42, role: 'owner' }
						]
					}
				}
			});
			requireAccess('category', 'read')(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('denies access if role does not grant capability', () => {
			let {req, res, next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42 },
					auth: {
						perms: [
						{ scope: 'tourn', id: 42, role: 'tabber' }
					]
				}
			}});
			requireAccess('tourn', 'owner')(req, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.json).toHaveBeenCalled();
		});

		it('allows access for child resource with parent permission', () => {
			let {req, res, next} = createContext({
				req: {
					person: { id: 1, siteAdmin: false },
					params: { tournId: 42, categoryId: 7 },
				auth: {
					perms: [
						{ scope: 'tourn', id: 42, role: 'owner' }
					]
				}
			}});
			requireAccess('category', 'write')(req, res, next);
			expect(next).toHaveBeenCalled();
		});

		it('denies access if no matching permission', () => {
			const {req, res, next} = createContext({
			req: {
				person: { id: 1, siteAdmin: false },
				params: { tournId: 42 },
				auth: {
					perms: [
						{ scope: 'event', id: 99, role: 'owner' }
					]
				}
			}});
			requireAccess('tourn', 'read')(req, res, next);
			expect(next).not.toHaveBeenCalled();
			expect(res.json).toHaveBeenCalled();
		});
	});
});