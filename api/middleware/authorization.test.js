import { describe } from "vitest";
import personRepo from '../repos/personRepo.js';
import { requireAreaAccess } from "./authorization.js";
import userData from '../../tests/testFixtures';
import config from '../../config/config.js';

describe("Authorization Middleware", () => {
     let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            cookies: {},
            config: {},
        };

        res = {
            status: vi.fn(() => res),
            json: vi.fn().mockReturnThis(),
            clearCookie: vi.fn(),
        };

        next = vi.fn();

        vi.restoreAllMocks();
    });
    describe("requireAreaAccess", () => {
        it("deny access when no user", async () => {
            // Arrange
            
            // Act
            await requireAreaAccess(req, res, next);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
        });
        it("deny access when no area access", async () => {
            // Arrange
            req.user = { id: 1 };
            req.params = { area: 'caselist' };

            vi.spyOn(personRepo, 'hasAreaAccess').mockResolvedValueOnce(false);

            // Act
            await requireAreaAccess(req, res, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: `Access to ${req.params.area} is forbidden for your API credentials`  });
        });
        it("allow access when has area access", async () => {
            // Arrange
            req.user = { id: 1 };
            req.params = { area: 'caselist' };

            vi.spyOn(personRepo, 'hasAreaAccess').mockResolvedValueOnce(true);

            // Act
            await requireAreaAccess(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
        });
    });
});