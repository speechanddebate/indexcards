import db from '../../data/db.js';
import config from '../../../config/config.js';

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

	return res.status(200).json(currentAds.map(ad => ({
		url: ad.url,
		imgSrc: `${config.S3_URL}/ads/${ad.id}/${ad.filename}`,
		background: ad.background,
	})));
};