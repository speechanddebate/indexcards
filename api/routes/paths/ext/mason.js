// Legacy hook functions coming server side from Perl/Mason.
// I hope to keep these to a minimum because it's not the right way to do, well,
// anything.
import { blastExtRoundPairing } from '../../../controllers/ext/mason/autoblast.js';

export default [
	{ path : '/ext/mason/round/{roundId}/blast' , module : blastExtRoundPairing } ,
];
