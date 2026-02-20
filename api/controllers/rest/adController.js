import db from '../../data/db.js';

export async function getAds(req, res) {
	return res.status(503);
};

export async function getPublishedAds(req,res) {
	const currentAds = await db.sequelize.query(`
		select id, filename, url, background
			from ad
		where ad.start < NOW()
			and ad.end > NOW()
			and ad.approved = 1
		order by ad.sort_order, RAND()
	`, {
		type: db.sequelize.QueryTypes.SELECT,
	});

	return res.status(200).json(currentAds);
};