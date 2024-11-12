import { blastSectionPairing, blastSectionMessage } from '../../../controllers/tab/section/blast.js';

export default [
	{ path : '/tab/{tournId}/section/{sectionId}/blastPairing' , module : blastSectionPairing },
	{ path : '/tab/{tournId}/section/{sectionId}/blastMessage' , module : blastSectionMessage },
];
