// Integrate with share.tabroom.com rooms.
import { blastRoundPairing } from '../../tab/round/blast.js';

export const blastExtRoundPairing = {
	POST: async (req, res) => {
		blastRoundPairing.POST(req, res);
	},
};

export default blastExtRoundPairing;
