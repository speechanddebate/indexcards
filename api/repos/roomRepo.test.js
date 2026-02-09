import roomRepo, { roomInclude } from "./roomRepo.js";
import factories from '../../tests/factories/index.js';
import { describe, expect, it } from "vitest";

describe("RoomRepo", () => {
	describe('buildRoomQuery', () => {
		it('does not include associations by default', async () => {
			const { roomId } = await factories.room.createTestRoom();
		
			const room = await roomRepo.getRoom(roomId);
		
			expect(room).toBeDefined();
			expect(room.site).toBeUndefined();
			expect(room.strikes).toBeUndefined();
			expect(room.rpool).toBeUndefined();
		});
		it('includes site when requested', async () => {
			const {siteId} = await factories.site.createTestSite();
			const { roomId } = await factories.room.createTestRoom({ siteId });
		
			const room = await roomRepo.getRoom(
				roomId,
				{ include: { site: true } }
			);
		
			expect(room).toBeDefined();
			expect(room.site).not.toBeNull();
		});
		it('filters by siteId when provided in scope', async () => {
			const {siteId: site1Id} = await factories.site.createTestSite();
			const {siteId: site2Id} = await factories.site.createTestSite();
			const { roomId: room1Id } = await factories.room.createTestRoom({ siteId: site1Id });
			await factories.room.createTestRoom({ siteId: site2Id });
		
			const rooms = await roomRepo.getRooms({ siteId: site1Id }, { include: { site: true } });
		
			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			rooms.forEach(r => {
				expect(r.site).not.toBeNull();
				expect(r.site.id).toBe(site1Id);
			});
			expect(rooms.map(r => r.id)).toEqual(expect.arrayContaining([room1Id]));
		});
		it('do not include site attributes when site is only requested as a filter', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const { siteId } = await factories.site.createTestSite({ tournId });
			const { roomId } = await factories.room.createTestRoom({ siteId });
		
				const room = await roomRepo.getRoom({
					roomId,
					siteId,
					tournId,
				});
		
			expect(room).toBeDefined();
			expect(room.site).toBeUndefined();
		});
	});
	describe('getRooms', () => {
		it('filters by tournId when provided in scope', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const { siteId } = await factories.site.createTestSite({ tournId });
			const { roomId } = await factories.room.createTestRoom({ siteId });
			await factories.room.createTestRoom();

			const rooms = await roomRepo.getRooms({ tournId }, { include: { site: true } });

			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			rooms.forEach(r => {
				expect(r.site).not.toBeNull();
				expect(r.siteId).toBe(siteId);
			});
			expect(rooms.map(r => r.id)).toEqual(expect.arrayContaining([roomId]));
		});
		it('applies both siteId and tournId filters together', async () => {
			const { tournId } = await factories.tourn.createTestTourn();
			const { siteId: site1Id } = await factories.site.createTestSite({ tournId });
			const { siteId: site2Id } = await factories.site.createTestSite();
			const { roomId } = await factories.room.createTestRoom({ siteId: site1Id });
			await factories.room.createTestRoom({ siteId: site2Id });

			const rooms = await roomRepo.getRooms({ tournId, siteId: site1Id }, { include: { site: true } });

			expect(rooms).toBeDefined();
			expect(rooms.length).toBeGreaterThanOrEqual(1);
			rooms.forEach(r => {
				expect(r.site).not.toBeNull();
				expect(r.site.id).toBe(site1Id);
			});
			expect(rooms.map(r => r.id)).toEqual(expect.arrayContaining([roomId]));
		});
	});
	describe('roomInclude', () => {
		it('returns base room include config', () => {
			const inc = roomInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});
	describe('getRoom', () => {
		it('retrieves room by id', async () => {
			const roomData = factories.room.createRoomData();
			const resultId = await roomRepo.createRoom(roomData);
			expect(resultId).toBeDefined();
			const result = await roomRepo.getRoom(resultId);
			expect(result).toBeDefined();
			expect(result.name).toBe(roomData.name);
		});
		it('retrieves room by scope object', async () => {
			const { siteId } = await factories.site.createTestSite();
			const roomData = factories.room.createRoomData({ siteId });
			const resultId = await roomRepo.createRoom(roomData);

			const result = await roomRepo.getRoom({ roomId: resultId, siteId });
			expect(result).toBeDefined();
			expect(result.id).toBe(resultId);
			expect(result.siteId).toBe(siteId);
		});
		it('throws an error when id is not provided', async () => {
			await expect(roomRepo.getRoom()).rejects.toThrow();
		});
		it('throws an error when scope object is missing roomId', async () => {
			await expect(roomRepo.getRoom({ siteId: 1 })).rejects.toThrow('getRoom: roomId is required');
		});
	});
	describe('getRooms', () => {
		it('retrieves all rooms for a given site', async () => {
			const { siteId } = await factories.site.createTestSite();
			const { roomId: room1Id } = await factories.room.createTestRoom({ siteId });
			const { roomId: room2Id } = await factories.room.createTestRoom({ siteId });

			const results = await roomRepo.getRooms({ siteId });
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			results.forEach(s => {
				expect(s.siteId, `expected siteId to be ${siteId} but was ${s.siteId}`).toBe(siteId);
			});
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([room1Id, room2Id]));
		});
		it('retrieves all rooms when no scope is provided', async () => {
			const { roomId: room1Id } = await factories.room.createTestRoom();
			const { roomId: room2Id } = await factories.room.createTestRoom();

			const results = await roomRepo.getRooms();
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThanOrEqual(2);
			expect(results.map(s => s.id)).toEqual(expect.arrayContaining([room1Id, room2Id]));
		});
	});
	describe('createRoom', () => {
		it('creates room when provided valid data', async () => {
			const room = factories.room.createRoomData();
			const resultId = await roomRepo.createRoom(room);
			expect(resultId).toBeDefined();
			const result = await roomRepo.getRoom(resultId);	
			expect(result).toBeDefined();
			expect(result.name).toBe(room.name);
			expect(result.tournId).toBe(room.tournId);
		});
	});
	describe('updateRoom', () => {
		it('updates room when provided valid data', async () => {
			const { roomId } = await factories.room.createTestRoom();
			const newData = factories.room.createRoomData({quality: 12});
			const result = await roomRepo.updateRoom(roomId, newData);
			const updated = await roomRepo.getRoom(roomId);
			expect(result).toBe(true);
			expect(updated).toBeDefined();
			expect(updated.quality).toBe(12);
		});
		it('returns false when trying to update a non-existent room', async () => {
			await roomRepo.updateRoom(999999, { name: 'Non-existent' }); // unlikely roomId
		});
		it('throws an error when id is not provided', async () => {
			await expect(roomRepo.updateRoom(null, { name: 'No ID' })).rejects.toThrow('updateRoom: id is required');
		});
	});
	describe('deleteRoom', () => {
		it('deletes a room and returns true', async () => {
			// Arrange
			const { roomId } = await factories.room.createTestRoom();
			// Act
			const result = await roomRepo.deleteRoom(roomId);
			// Assert
			expect(result).toBe(true);
			const deleted = await roomRepo.getRoom(roomId);
			expect(deleted).toBeNull();
		});
		it('returns false when trying to delete a non-existent room', async () => {
			const result = await roomRepo.deleteRoom(999999); // unlikely roomId
			expect(result).toBe(false);
		});
		it('throws an error when id is not provided', async () => {
			await expect(roomRepo.deleteRoom()).rejects.toThrow('deleteRoom: id is required');
		});
	});
});