import { describe, it, expect } from "vitest";
import factories from "../../tests/factories/index.js";
import personRepo, { personInclude } from "./personRepo.js";

describe("PersonRepo", () => {
	describe('personInclude', () => {
		it('returns base person include config', () => {
			const inc = personInclude();
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
    describe("getPersonByApiKey", () => {
        it("returns the person when the key is valid", async () => {
            // Arrange
            const { personId } = await factories.person.createTestPerson({
				settings: {
					api_key: "goodkey",
				}
			});
            // Act
            const result = await personRepo.getPersonByApiKey(personId, "goodkey");

            // Assert
            expect(result).not.toBeNull();
            expect(result.id).toBe(personId);
        });

        it("returns null when the key is invalid", async () => {
            // Arrange
            const { personId } = await factories.person.createTestPerson({
				settings: {
					api_key: "badkey",
				}
			});

            // Act
            const result = await personRepo.getPersonByApiKey(personId, "goodkey");

            // Assert
            expect(result).toBeNull();
        });


        it("returns null when the person id is wrong", async () => {
            // Arrange
			const { personId } = await factories.person.createTestPerson({
				settings: {
					api_key: "badkey",
				}
			});
            // Act
            const result = await personRepo.getPersonByApiKey(3, "goodkey");

            // Assert
            expect(result).toBeNull();
        });

    });
    describe("hasAreaAccess", () => {
        it("returns true when person has access", async () => {
            // Arrange

            const { personId } = await factories.person.createTestPerson({
				settings: {
					api_auth_caselist: "1",
				}
			});

            // Act
            const result = await personRepo.hasAreaAccess(personId, "caselist");

            // Assert
            expect(result).toBe(true);
        });

        it("returns false when person does not have access", async () => {
            // Arrange
			const { personId } = await factories.person.createTestPerson();

            // Act
            const result = await personRepo.hasAreaAccess(personId, "caselist");

            // Assert
            expect(result).toBe(false);
        });
    });
});
