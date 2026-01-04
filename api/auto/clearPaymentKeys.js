import db from '../helpers/litedb.js';

export const clearPaymentKeys = async () => {

	await db.sequelize.query(`
		DELETE TS FROM tourn_setting TS    
		INNER JOIN tourn T ON T.id = TS.tourn    
		WHERE     
			T.end < NOW() - INTERVAL 14 DAY
			AND (TS.tag LIKE '%authorizenet%' 
				OR TS.tag LIKE '%paypal%'
				OR TS.tag LIKE '%stripe%'
			)    
	`, {
		type : db.sequelize.QueryTypes.DELETE,
	});

	return 'Paypal/Authorize/Stripe Payment keys deleted for tournaments more than two weeks over.';
};

await clearPaymentKeys();
process.exit();

export default clearPaymentKeys;
