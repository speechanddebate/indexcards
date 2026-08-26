import con from './ballotsController.js';
import sectionRepo from '../../../repos/sectionRepo.js';
import { createContext } from '../../../../tests/httpMocks.js';
import z from 'zod';
import { CurrentBallot } from '../../../routes/openapi/schemas/Section.js';
import { offset } from '../../../routes/openapi/schemas/utils.js';

vi.mock('../../../repos/sectionRepo.js');


describe('getCurrent', () => {
	it('should not return unpublished rounds', async () => {
		// Mock data
		const mockBallots = [
			{ Round: { published: false } },
		];
		vi.spyOn(sectionRepo, 'getCurrentBallots').mockResolvedValueOnce(mockBallots);

		// Mock request and response
		const {req, res } = createContext({ actor: { Person: { id: 123 } } });

		// Call the controller function
		await con.getCurrent(req, res);

		// Assertions
		expect(res).not.toBeProblemResponse();
		expect(res.body).toEqual([]);
	});
	it('should correctly return a flighted round', async () => {
		// Mock data
		const roundStart = new Date();
		const offset = 50;
		const mockBallots = [
			{ 
				Round: { 
					start: roundStart.toISOString(),
					end: new Date(Date.now() + 3600000).toISOString(),
					published: true,
					flighted: 1, 
					settings: {
						judges_ballots_visible: 1
					}
				},
				Ballots: [{audit: 0}],
				Judge: {
					Category: {
						Tourn: { settings: { legion: 0 } },
						Event: {
							type: 'debate',
							settings: {
								flight_offset: offset,
								online_mode: 'sync',
								start_button: 'Start Debate',
								start_button_text: 'Please start your debate'
							}
						}
					}
				},
				Room: { id: 1, name: 'Room A' },
				Timeslot: { start: new Date().toISOString(), end: new Date(Date.now() + 3600000).toISOString() },
				start: new Date().toISOString(),
				end: new Date(Date.now() + 3600000).toISOString(),
				settings: {
					flip_status: 0,
					show_async: 1
				},
				scored: false,
				id: 1,
				flight: 2,
				Entries: [],
		},
		];
		vi.spyOn(sectionRepo, 'getCurrentBallots').mockResolvedValueOnce(mockBallots);

		// Mock request and response
		const {req, res } = createContext({ actor: { Person: { id: 123 } } });

		// Call the controller function
		await con.getCurrent(req, res);

		// Assertions
		expect(res).not.toBeProblemResponse();
		//expect(res.body).toMatchSchema(z.array(CurrentBallot));
		const returnedBallot = res.body[0];
		expect(returnedBallot.flight).toBe(2);
		expect(returnedBallot.start).toBeDefined();
		expect(returnedBallot.start).toBe(new Date(roundStart.getTime() + offset * 60_000).toISOString());
		expect(returnedBallot.deadline).toBeDefined();
		expect(returnedBallot.status).toBe('not_started');
	});
});
