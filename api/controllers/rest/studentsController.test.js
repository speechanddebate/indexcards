import { createContext } from '../../../tests/httpMocks.ts';
import * as controller from './studentsController.js';
import studentRepo from '../../repos/studentRepo.js';
import personRepo from '../../repos/personRepo.js';
import changeLogRepo from '../../repos/changeLogRepo.js';
import logger from '../../helpers/logger.js';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('studentsController', () => {
	describe('unlinkedSearch', () => {
		it('returns mapped student results and updates settings for non-admin actor', async () => {
			vi.spyOn(changeLogRepo, 'createChangeLog').mockResolvedValue({});
			vi.spyOn(personRepo, 'getPerson').mockResolvedValue({
				id: 10,
				settings: {
					student_search_count: 0,
				},
			});
			const savePersonSettingsSpy = vi.spyOn(personRepo, 'savePersonSettings').mockResolvedValue(undefined);
			vi.spyOn(studentRepo, 'unlinkedSearch').mockResolvedValue([
				{
					id: 101,
					first: 'Test',
					middle: 'Q',
					last: 'Student',
					chapter_name: 'Lincoln',
					chapter_state: 'NE',
					tourn_count: 2,
				},
			]);

			const { req, res } = createContext({
				valid: { query: { first: 'Te', last: 'St' } },
				actor: { id: 10, Person: { siteAdmin: false } },
				session: { id: 88, person: 10, su: null },
			});

			await controller.unlinkedSearch(req, res);

			expect(personRepo.getPerson).toHaveBeenCalledWith(10, {
				settings: ['last_student_search', 'student_search_count'],
			});
			expect(savePersonSettingsSpy).toHaveBeenCalledWith(10, {
				student_search_count: 1,
				last_student_search: expect.any(Date),
			});
			expect(studentRepo.unlinkedSearch).toHaveBeenCalledWith({ first: 'Te', last: 'St' });
			expect(res.body).toEqual([
				{
					id: 101,
					first: 'Test',
					middle: 'Q',
					last: 'Student',
					gradYear: null,
					Chapter: {
						name: 'Lincoln',
						state: 'NE',
					},
					tournCount: 2,
				},
			]);
		});

		it('returns 429 and skips search when person exceeds 24h limit', async () => {
			vi.spyOn(changeLogRepo, 'createChangeLog').mockResolvedValue({});
			vi.spyOn(personRepo, 'getPerson').mockResolvedValue({
				id: 10,
				settings: {
					last_student_search: new Date(),
					student_search_count: 10,
				},
			});
			const savePersonSettingsSpy = vi.spyOn(personRepo, 'savePersonSettings').mockResolvedValue(undefined);
			const unlinkedSearchSpy = vi.spyOn(studentRepo, 'unlinkedSearch').mockResolvedValue([]);

			const { req, res } = createContext({
				valid: { query: { first: 'Te', last: 'St' } },
				actor: { id: 10, Person: { siteAdmin: false } },
				session: { id: 90, person: 10, su: null },
			});

			await controller.unlinkedSearch(req, res);

			expect(res).toBeProblemResponse(429);
			expect(unlinkedSearchSpy).not.toHaveBeenCalled();
			expect(savePersonSettingsSpy).not.toHaveBeenCalled();
		});

		it('logs rich student-search description with su email and session id', async () => {
			const createChangeLogSpy = vi.spyOn(changeLogRepo, 'createChangeLog').mockResolvedValue({});
			vi.spyOn(studentRepo, 'unlinkedSearch').mockResolvedValue([]);
			vi.spyOn(personRepo, 'getPerson').mockResolvedValue({
				id: 11,
				settings: {
					student_search_count: 0,
				},
			});
			vi.spyOn(personRepo, 'savePersonSettings').mockResolvedValue(undefined);

			const { req, res } = createContext({
				valid: { query: { first: 'Ada', last: 'Lovelace' } },
				actor: { id: 11, Person: { siteAdmin: false } },
				session: {
					id: 1234,
					person: 11,
					su: 45,
					Su: { email: 'admin@example.com' },
				},
			});

			await controller.unlinkedSearch(req, res);
			await Promise.resolve();

			expect(createChangeLogSpy).toHaveBeenCalledWith({
				tag: 'student_search',
				person: 45,
				description: 'Searched for student records Ada Lovelace while logged in as admin@example.com from session ID 1234',
			});
		});

		it('logs an error when change log save fails', async () => {
			const logError = new Error('change log write failed');
			vi.spyOn(changeLogRepo, 'createChangeLog').mockRejectedValue(logError);
			const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => { });
			vi.spyOn(studentRepo, 'unlinkedSearch').mockResolvedValue([]);

			const { req, res } = createContext({
				valid: { query: { first: 'Test', last: 'User' } },
				actor: { id: 12, Person: { siteAdmin: true } },
				session: { id: 222, person: 12, su: null },
			});

			await controller.unlinkedSearch(req, res);
			await Promise.resolve();

			expect(loggerErrorSpy).toHaveBeenCalledWith(
				'Failed to log student search usage to changeLog:',
				logError
			);
			expect(res.statusCode).toBe(200);
		});
		it('defaults to the users first and last on no params', async () => {
			vi.spyOn(changeLogRepo, 'createChangeLog').mockResolvedValue({});
			vi.spyOn(personRepo, 'getPerson').mockResolvedValue({
				id: 10,
				settings: {
					student_search_count: 0,
				},
			});
			const savePersonSettingsSpy = vi.spyOn(personRepo, 'savePersonSettings').mockResolvedValue(undefined);
			vi.spyOn(studentRepo, 'unlinkedSearch').mockResolvedValue([
				{
					id: 101,
					first: 'Test',
					middle: 'Q',
					last: 'Student',
					chapter_name: 'Lincoln',
					chapter_state: 'NE',
					tourn_count: 2,
				},
			]);

			const { req, res } = createContext({
				valid: { query: {} },
				actor: {
					id: 10, Person: {
						first: 'Test',
						last: 'Student',
						siteAdmin: false,
					},
				},
				session: { id: 88, person: 10, su: null },
			});

			await controller.unlinkedSearch(req, res);

			expect(personRepo.getPerson).toHaveBeenCalledWith(10, {
				settings: ['last_student_search', 'student_search_count'],
			});
			expect(savePersonSettingsSpy).toHaveBeenCalledWith(10, {
				student_search_count: 1,
				last_student_search: expect.any(Date),
			});
			expect(studentRepo.unlinkedSearch).toHaveBeenCalledWith({ first: 'Test', last: 'Student' });
			expect(res.body).toEqual([
				{
					id: 101,
					first: 'Test',
					middle: 'Q',
					last: 'Student',
					gradYear: null,
					Chapter: {
						name: 'Lincoln',
						state: 'NE',
					},
					tournCount: 2,
				},
			]);

		});
	});
});
