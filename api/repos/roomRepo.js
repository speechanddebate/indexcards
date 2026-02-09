import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/roomMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { siteInclude } from './siteRepo.js';

function buildRoomQuery(opts = {},scope = {},) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	// Determine if we need site include
	if (opts.include?.site || scope?.siteId || scope?.tournId) {
		const siteIncludeQuery = siteInclude(opts.include?.site);
		if (!opts.include?.site) {
			siteIncludeQuery.attributes = []; // do not select any columns from site if not explicitly requested
		}

		// Apply scope filters
		siteIncludeQuery.where = {};

		if (scope.siteId) {
			siteIncludeQuery.where.id = scope.siteId;
		}

		// Filter site by tournId via M2M
		if (scope.tournId) {
			siteIncludeQuery.include = [
				...(siteIncludeQuery.include),
				{
					model: db.tournSite,
					as: 'tourn_sites',
					where: { tourn: scope.tournId },
					required: true,
					attributes: [],
				},
			];
		}

		// Required inner join if filtering by site or tourn
		siteIncludeQuery.required = !!(scope.siteId || scope.tournId);

		query.include.push(siteIncludeQuery);
	}

	return query;
}

export function roomInclude(opts = {}) {
	return {
		model: db.room,
		as: 'rooms',
		...buildRoomQuery(opts),
	};
}

async function getRoom(ref, opts = {}) {
	if (!ref) throw new Error('getRoom: id or scope is required');

	const isScoped = typeof ref === 'object';
	const roomId = isScoped ? ref.roomId : ref;

	if (!roomId) throw new Error('getRoom: roomId is required');

	const scope = isScoped ? { ...ref } : {};
	delete scope.roomId;

	const query = buildRoomQuery(opts, scope);

	query.where.id = roomId;

	const room = await db.room.findOne(query);
	return toDomain(room);
}

async function getRooms(scope, opts = {}) {
	const query = buildRoomQuery(opts,scope);

	const rooms = await db.room.findAll(query);
	return rooms.map(toDomain);
}

async function createRoom(roomData) {
	const persistenceData = toPersistence(roomData);
	const newRoom = await db.room.create(persistenceData);
	return newRoom.id;
}

async function updateRoom(id, roomData) {
	if (!id) throw new Error('updateRoom: id is required');
	const persistenceData = toPersistence(roomData);
	const [rows] = await db.room.update(persistenceData, { where: { id } });
	return rows > 0;
}

async function deleteRoom(id) {
	if (!id) throw new Error('deleteRoom: id is required');
	const rows = await db.room.destroy({ where: { id } });
	return rows > 0;
}

export default {
	getRoom,
	getRooms,
	createRoom,
	updateRoom,
	deleteRoom,
};