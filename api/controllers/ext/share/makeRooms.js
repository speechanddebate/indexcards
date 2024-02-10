// Integrate with share.tabroom.com rooms.
import { makeShareRooms } from  '../../tab/round/share.js';

export const makeExtShareRooms = {
	POST: async (req, res) => {

		// Glue code to hook into one source of truth for this function.
		// This hook will eventually go away because this is just an
		// authentication bridge from legacy Tabroom into the API. This
		// approach is dumb and hacky but there isn't exactly a correct
		// best practice way to integrate an express/node API with a
		// friggin Perl/Mason application so I'm just winging it.

		req.params = { roundId: req.body.roundId };
		makeShareRooms.POST(req, res);
	},
};

export default makeExtShareRooms;
