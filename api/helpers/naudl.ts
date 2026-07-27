import axios from 'axios';
import config from '../config.js';

export const getSalesforceStudents = async (naudlChapter: string) => {
	const authData = await authSalesforce();
	const queryBase = `${authData.instance_url}/services/data/v59.0/query`;
	const queryText = `?q=SELECT+Id,Tabroom_ID__c,School__c+FROM+Student__c+WHERE+School__c=+'${naudlChapter}'`;

	const getResponse = await axios.get(
		`${queryBase}${queryText}`,
		{
			headers : {
				Authorization  : `OAuth ${authData.access_token}`,
				'Content-Type' : 'application/json',
				Accept         : 'application/json',
			},
		}
	);

	return getResponse.data?.records;
};

export const getOneSalesforceStudent = async (studentId: string) => {
	const authData = await authSalesforce();
	const queryBase = `${authData.instance_url}/services/data/v59.0/query`;
	const queryText = `?q=SELECT+Id,Tabroom_ID__c,School__c+FROM+Student__c+WHERE+Tabroom_ID__c=+'${studentId}'`;

	const getResponse = await axios.get(
		`${queryBase}${queryText}`,
		{
			headers : {
				Authorization  : `OAuth ${authData.access_token}`,
				'Content-Type' : 'application/json',
				Accept         : 'application/json',
			},
		}
	);

	return getResponse.data?.records[0];
};

export const getAllSalesforceStudents = async () => {
	const authData = await authSalesforce();
	const queryBase = `${authData.instance_url}/services/data/v59.0/query`;
	const queryText = `?q=SELECT+Id,Tabroom_ID__c,School__c+FROM+Student__c+WHERE+Tabroom_ID__c!=null`;

	const getResponse = await axios.get(
		`${queryBase}${queryText}`,
		{
			headers : {
				Authorization  : `OAuth ${authData.access_token}`,
				'Content-Type' : 'application/json',
				Accept         : 'application/json',
			},
		}
	);

	return getResponse.data?.records;
};

export const postSalesforceStudents = async (body: Record<string, any>) => {

	const authData = await authSalesforce();
	if (authData) {
		const postResponse = await axios.post(
			`${authData.instance_url}${config.naudl.student_endpoint}`,
			body,
			{
				headers : {
					Authorization  : `OAuth ${authData.access_token}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			}
		);
		return postResponse;
	}

	return 'Authentication Failure';
};

export const getSalesforceChapters = async () => {

	const authData = await authSalesforce();
	const queryBase = `${authData.instance_url}/services/data/v59.0/query`;
	const queryText = `?q=SELECT+Id,Tabroom_teamid__c,IsDeleted+FROM+School__c+WHERE+Tabroom_teamid__c!=null`;

	const getResponse = await axios.get(
		`${queryBase}${queryText}`,
		{
			headers : {
				Authorization  : `OAuth ${authData.access_token}`,
				'Content-Type' : 'application/json',
				Accept         : 'application/json',
			},
		}
	);

	return getResponse.data?.records;
};

const authSalesforce = async () => {

	const naudl = config.naudl;

	const authClient = `grant_type=password&client_id=${naudl.client_id}&client_secret=${naudl.client_secret}`;
	const authUser = `&username=${naudl.username}&password=${naudl.pw}`;
	const authResponse = await axios.post(
		`https://login.salesforce.com/services/oauth2/token?${authClient}${authUser}`,
	);

	if (authResponse && authResponse.data) {
		return authResponse.data;
	}

	return false;
};

export default authSalesforce;
