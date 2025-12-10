import { describe, it, expect } from "vitest";
import db from "../data/db.js";
import personRepo from "./personRepo.js";

// Use a transaction to isolate tests this should probably go in a global setup file but too many other tests rely on seeded data and don't use transactions
let tx;
beforeEach(async () => {
    tx = await db.sequelize.transaction();
});

afterEach(async () => {
    await tx.rollback();
});

describe("PersonRepo", () => {
    describe("getPersonByApiKey", () => {
        it("returns the person when the key is valid", async () => {
            // Arrange
            const person = await db.person.create({
                email: `test_${crypto.randomUUID()}@example.com`,
            });

            const person_setting = await db.personSetting.create({
                person: person.id,
                tag: "api_key",
                value: "goodkey"
            });
            // Act
            const result = await personRepo.getPersonByApiKey(person.id, "goodkey");

            // Assert
            expect(result).not.toBeNull();
            expect(result.id).toBe(person.id);
        });

        it("returns null when the key is invalid", async () => {
            // Arrange
            const person = await db.person.create({
                email: `test_${crypto.randomUUID()}@example.com`,
            });

            const person_setting = await db.personSetting.create({
                person: person.id,
                tag: "api_key",
                value: "badkey"
            });
            // Act
            const result = await personRepo.getPersonByApiKey(person.id, "goodkey");

            // Assert
            expect(result).toBeNull();
        });


        it("returns null when the person id is wrong", async () => {
            // Arrange
            const person = await db.person.create({
                email: `test_${crypto.randomUUID()}@example.com`,
            });
            const person_setting = await db.personSetting.create({
                person: person.id,
                tag: "api_key",
                value: "badkey"
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
            const person = await db.person.create({
                email: `test_${crypto.randomUUID()}@example.com`,
            });

            const person_setting = await db.personSetting.create({
                person: person.id,
                tag: "api_auth_caselist",
                value: "1"
            });
            // Act
            const result = await personRepo.hasAreaAccess(person.id, "caselist");

            // Assert
            expect(result).toBe(true);
        });

        it("returns false when person does not have access", async () => {
            // Arrange
            const person = await db.person.create({
                email: `test_${crypto.randomUUID()}@example.com`,
            });

            // Act
            const result = await personRepo.hasAreaAccess(person.id, "caselist");

            // Assert
            expect(result).toBe(false);
        });
    });
});
