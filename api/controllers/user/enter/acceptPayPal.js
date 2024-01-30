import { emailBlast } from '../../../helpers/mail';
import { debugLogger } from '../../../helpers/logger';

export const acceptPayPalPayment = {

	POST: async (req, res) => {

		const db = req.db;
		const orderData = req.body;
		const payerName = `${orderData.payer.name.given_name} ${orderData.payer.name.surname}`;
		const payerEmail = orderData.payer.email_address;

		const paymentObject = {
			reason    : `PayPal Payment from ${payerName} ${payerEmail}`,
			amount    : parseFloat(orderData.purchase_units[0]?.amount.value) * -1,
			school    : orderData.purchase_units[0]?.custom_id,
			payment   : true,
			levied_at : Date(orderData.create_time),
			levied_by : orderData.person_id,
		};

		const payPalObject = {
			reason    : `Online Payment Processing Fee`,
			amount    : parseFloat(orderData.payment_fee),
			school    : orderData.purchase_units[0]?.custom_id,
			payment   : false,
			levied_at : Date(orderData.create_time),
			levied_by : orderData.person_id,
		};

		await db.fine.create(paymentObject);
		await db.fine.create(payPalObject);

		try {
			let message = `Thank you for your payment on Tabroom.com for ${orderData.tourn_name}\n`;
			message += `Tournament: ${orderData.tourn_name}\n`;
			message += `School: ${orderData.school_name}\n`;
			message += `Amount: ${parseFloat(orderData.purchase_units[0]?.amount.value)}\n`;
			message += `Payment Date: ${new Date().toLocaleString()}\n`;
			message += `If you have any questions, please contact the tournament, not Tabroom.com.\n`;

			const messageData = {
				email: payerEmail,
				to: payerEmail,
				text    : message,
				subject : `Tabroom.com payment receipt for ${orderData.tourn_name}`,
			};
			await emailBlast(messageData);
			debugLogger.info(`Email receipt sent to ${payerEmail}`);
		} catch (err) {
			debugLogger.info(`Failed to send email receipt to ${payerEmail}: ${err}`);
		}

		res.status(200);
	},
};

acceptPayPalPayment.POST.apiDoc = {
	summary: 'Record a payment from PayPal',
	operationId: 'acceptPayPalPayment',
	requestBody: {
		description: 'The order details',
		required: true,
		content: { '*/*': { schema: { type: 'object' } } },
	},
	responses: {
		200: {
			description: 'PayPal payment',
			content: {
				'*/*': {
					schema: {
						type: 'string',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default acceptPayPalPayment;
