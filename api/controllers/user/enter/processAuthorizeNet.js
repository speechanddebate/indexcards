import authorizenet from 'authorizenet';
import { debugLogger } from '../../../helpers/logger';

export const processAuthorizeNet = {
	POST: async (req, res) => {
		const db = req.db;

		const orderData = req.body;

		const apiLogin = await db.tournSetting.findOne({
			where : {
				tourn: orderData.tourn,
				tag  : 'authorizenet_api_login',
			},
		});
		const transactionKey = await db.tournSetting.findOne({
			where : {
				tourn: orderData.tourn,
				tag  : 'authorizenet_transaction_key',
			},
		});

		if (!apiLogin || !transactionKey) {
			return res.status(500).json({ message: 'Missing Authorize.net credentials for this tournament' });
		}

		const payerName = `${orderData.customerInformation?.firstName} ${orderData.customerInformation?.lastName}`;

		const dataDescriptor = orderData.opaqueData?.dataDescriptor;
		const dataValue = orderData.opaqueData?.dataValue;

		if (!dataDescriptor || !dataValue) {
			return res.status(500).json({ message: 'Missing payment data' });
		}

		if (!orderData.base) {
			return res.status(500).json({ message: 'Missing base amount' });
		}
		if (orderData.base < 10) {
			return res.status(500).json({ message: '$10 minimum for online payments' });
		}

		const processing = orderData.base * 0.04;
		let total = processing + orderData.base;
		total = total.toFixed(2);

		const APIContracts = authorizenet.APIContracts;
		const APIControllers = authorizenet.APIControllers;

		const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
		merchantAuthenticationType.setName(apiLogin.dataValues.value);
		merchantAuthenticationType.setTransactionKey(transactionKey.dataValues.value);

		const opaqueData = new APIContracts.OpaqueDataType();
		opaqueData.setDataDescriptor(dataDescriptor);
		opaqueData.setDataValue(dataValue);

		const paymentType = new APIContracts.PaymentType();
		paymentType.setOpaqueData(opaqueData);

		const orderDetails = new APIContracts.OrderType();
		orderDetails.setDescription(`${orderData.tourn_name} Registration Fees for ${orderData.school_name}`);

		const billTo = new APIContracts.CustomerAddressType();
		billTo.setFirstName(orderData.customerInformation?.firstName);
		billTo.setLastName(orderData.customerInformation?.lastName);

		const lineItemId1 = new APIContracts.LineItemType();
		lineItemId1.setItemId('1');
		lineItemId1.setName(`Registration Fees`);
		lineItemId1.setDescription(`${orderData.tourn_name} Registration Fees for ${orderData.school_name}`);
		lineItemId1.setQuantity('1');
		lineItemId1.setUnitPrice(total);

		const lineItemList = [];
		lineItemList.push(lineItemId1);

		const lineItems = new APIContracts.ArrayOfLineItem();
		lineItems.setLineItem(lineItemList);

		const transactionSetting1 = new APIContracts.SettingType();
		transactionSetting1.setSettingName('duplicateWindow');
		transactionSetting1.setSettingValue('120');

		const transactionSetting2 = new APIContracts.SettingType();
		transactionSetting2.setSettingName('recurringBilling');
		transactionSetting2.setSettingValue('false');

		const transactionSettingList = [];
		transactionSettingList.push(transactionSetting1);
		transactionSettingList.push(transactionSetting2);

		const transactionSettings = new APIContracts.ArrayOfSetting();
		transactionSettings.setSetting(transactionSettingList);

		const transactionRequestType = new APIContracts.TransactionRequestType();
		transactionRequestType.setTransactionType(
			APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
		);
		transactionRequestType.setPayment(paymentType);
		transactionRequestType.setAmount(total);
		transactionRequestType.setLineItems(lineItems);
		transactionRequestType.setOrder(orderDetails);
		transactionRequestType.setBillTo(billTo);
		transactionRequestType.setTransactionSettings(transactionSettings);

		const createRequest = new APIContracts.CreateTransactionRequest();
		createRequest.setMerchantAuthentication(merchantAuthenticationType);
		createRequest.setTransactionRequest(transactionRequestType);

		// debugLogger.info(JSON.stringify(createRequest.getJSON(), null, 2));

		const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

		// Defaults to sandbox
		// if (process.env.NODE_ENV === 'production') {
		// 	ctrl.setEnvironment(authorizenet.Constants.endpoint.production);
		// }

		try {
			const result = await new Promise((resolve, reject) => {
				ctrl.execute(async () => {
					const apiResponse = ctrl.getResponse();
					const response = new APIContracts.CreateTransactionResponse(apiResponse);

					// debugLogger.info(JSON.stringify(response, null, 2));

					if (response != null) {
						if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
							if (response.getTransactionResponse().getMessages() != null) {
								const transactionId = response.getTransactionResponse()
									.getTransId();
								const responseCode = response.getTransactionResponse()
									.getResponseCode();
								const messageCode = response.getTransactionResponse()
									.getMessages().getMessage()[0].getCode();
								const description = response.getTransactionResponse()
									.getMessages().getMessage()[0].getDescription();
								debugLogger.info(`Successful Authorize.net transaction. ID: ${transactionId}, Response Code: ${responseCode}, Message Code: ${messageCode}, Description: ${description}`);

								const paymentObject = {
									reason    : `Authorize.net Payment from ${payerName} (${orderData.person_email}), transaction ID ${transactionId}`,
									amount    : parseFloat(orderData.base) * -1,
									school    : orderData.school,
									payment   : true,
									levied_at : new Date(),
									levied_by : orderData.person_id,
								};

								const feeObject = {
									reason    : `Online Payment Processing Fee`,
									amount    : parseFloat(processing),
									school    : orderData.school,
									payment   : false,
									levied_at : new Date(),
									levied_by : orderData.person_id,
								};

								await db.fine.create(paymentObject);
								await db.fine.create(feeObject);
								resolve(response);
							} else {
								debugLogger.info('Failed Transaction.');
								if (response.getTransactionResponse().getErrors() != null) {
									const errorCode = response.getTransactionResponse()
										.getErrors().getError()[0].getErrorCode();
									const errorText = response.getTransactionResponse()
										.getErrors().getError()[0].getErrorText();
									debugLogger.info(`Failed Authorize.net transaction. Error ${errorCode}: ${errorText}`);
								}
								reject(response);
							}
						} else {
							if (response.getTransactionResponse() != null
								&& response.getTransactionResponse().getErrors() != null) {
								const errorCode = response.getTransactionResponse()
									.getErrors().getError()[0].getErrorCode();
								const errorText = response.getTransactionResponse()
									.getErrors().getError()[0].getErrorText();
								debugLogger.info(`Failed Authorize.net transaction. Error ${errorCode}: ${errorText}`);
							} else {
								const errorCode = response.getMessages().getMessage()[0].getCode();
								const errorText = response.getMessages().getMessage()[0].getText();
								debugLogger.info(`Failed Authorize.net transaction. Error ${errorCode}: ${errorText}`);
							}
							reject(response);
						}
					} else {
						debugLogger.info('Failed Authorize.net transaction. Null response.');
						reject(response);
					}
				});
			});
			return res.status(200).json(result);
		} catch (err) {
			return res.status(400).json(err);
		}
	},
};

processAuthorizeNet.POST.apiDoc = {
	summary: 'Process a payment through Authorize',
	operationId: 'processAuthorizeNet',
	requestBody: {
		description: 'The order details',
		required: true,
		content: { '*/*': { schema: { type: 'object' } } },
	},
	responses: {
		200: {
			description: 'Authorize payment',
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

export default processAuthorizeNet;
