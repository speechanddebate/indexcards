import { describe } from "vitest";
import personRepo from '../repos/personRepo.js';
import { requireAreaAccess } from "./authorization.js";
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
});