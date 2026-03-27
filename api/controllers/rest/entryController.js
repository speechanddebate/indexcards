import { NotImplemented, NotFound } from '../../helpers/problem.js';
import { entryRecords } from '../../services/results/entryRecords.js';

export async function getEntry(req, res) {
	return NotImplemented(req,res,'Not implemented');
};

export async function getEntryRecords(req, res) {

	// This is public only for now but at some point needs to be auth informed
	// so that coaches, entries, and admins get the full shebang as outlined in
	// the service function.

	const records = await entryRecords(req.params.entryId, req.params.tournId);

	if (records === 401) {
		return NotFound( req, res, 'No published data on that entry was found' );
	}

	return res.status(200).json(records);
};
