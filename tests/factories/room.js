import roomRepo from '../../api/repos/roomRepo.js';
import { fakeSchoolName } from './factoryUtils.js';
import { faker } from '@faker-js/faker';

export function createRoomData(overrides = {}) {
	return {
		name: faker.helpers.arrayElement([
			`Room ${faker.number.int({ min: 100, max: 999 })}`,
			`${faker.number.int({ min: 100, max: 999 })}`,
		]),
		building: fakeSchoolName(),
		...overrides,
	};
}

export async function createTestRoom(overrides = {}) {
	const data = createRoomData(overrides);
	const roomId = await roomRepo.createRoom(data);

	return {
		roomId,
		getRoom: () => roomRepo.getRoom(roomId),
	};
}
export default {
	createRoomData,
	createTestRoom,
};