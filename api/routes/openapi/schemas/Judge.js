/**
 *  A record of a judge's decision. used in paradigm details
 */
export const JudgeRecord = {
	type: 'object',
	properties: {
		tournName: { type: 'string', description: 'Tournament name' },
		roundDate: { type: 'string', format: 'date-time', description: 'Date of the round' },
		roundLabel: { type: 'string', description: 'Label for the round (e.g., R2)' },
		eventAbbr: { type: 'string', description: 'Event abbreviation (e.g., PF)' },
		affTeam: { type: 'string', description: 'Affirmative team name' },
		affLabel: { type: 'string', description: 'Affirmative label (e.g., Pro)' },
		negTeam: { type: 'string', description: 'Negative team name' },
		negLabel: { type: 'string', description: 'Negative label (e.g., Con)' },
		vote: { type: 'string', description: 'This judge\'s vote (e.g., Con)' },
		panelVote: { type: 'string', description: 'Panel majority vote (e.g., Con)' },
		record: { type: 'string', description: 'Win-loss record for the round (e.g., 0-1)' },
	},
	additionalProperties: false,
};