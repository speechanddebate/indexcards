import { describe, it, expect } from "vitest";
import db from "../data/db.js";
import fileRepo from "./fileRepo.js";

describe("FileRepo", () => {
    describe('getFiles', () => {
        it('include unpublished files when specified', async () => {
            // Arrange
            const unpublishedFile = await db.file.create({
                published: 0,
                tag: "test",
                label: "Unpublished File",
                filename: "unpublishedfile.pdf"
            });

            // Act
            const files = await fileRepo.getFiles({}, { includeUnpublished: true });
            // Assert
            const matchedFile = files.find(f => f.id === unpublishedFile.id);
            expect(matchedFile).toBeDefined();
            expect(matchedFile.label).toBe("Unpublished File");
            expect(matchedFile.filename).toBe("unpublishedfile.pdf");
        });
        it('returns error when invalid scope is provided', async () => {
            // Arrange
            let errorCaught = null;

            // Act
            try {
                await fileRepo.getFiles({
                    scope: { invalidScope: 123 },
                });
            } catch (error) {
                errorCaught = error;
            }

            // Assert
            expect(errorCaught).toBeInstanceOf(Error);
        });
    });
    describe("getTournFiles", () => {
        it("returns only published tourn files when given tournId", async () => {
            // Arrange
            const tournInstance = await db.tourn.create({
                name: "Test Tournament",
                webname: "testtourn",
                start: new Date(),
                end: new Date(),
            });
            const file = await db.file.create({
                tourn: tournInstance.id,
                published: 1,
                tag: "test",
                label: "Test File",
                filename: "testfile.pdf"
            });
            const unpublishedFile = await db.file.create({
                tourn: tournInstance.id,
                published: 0,
                tag: "test",
                label: "Test File",
                filename: "testfile.pdf"
            });

            // Act
            const files = await fileRepo.getFiles({ tournId: tournInstance.id });

            // Assert
            expect(files).toBeInstanceOf(Array);
            //expect on of the files to match the created file
            const matchedFile = files.find(f => f.id === file.id);
            expect(matchedFile).toBeDefined();
            expect(matchedFile.label).toBe("Test File");
            expect(matchedFile.filename).toBe("testfile.pdf");
            //expect all files to have tournId and published = true
            for (const f of files) {
                expect(f.tournId).toBe(tournInstance.id);
                expect(f.published).toBe(true);
            }
        });
    });
});

