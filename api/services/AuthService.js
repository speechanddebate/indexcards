import { verifyPassword } from '../repos/personRepo.js';
import sessionRepo from '../repos/sessionRepo.js';
import crypto from 'crypto';
export async function login(username, password, context = {}) {
	const { ip, agentData } = context;
	const person = await verifyPassword(username, password);

	if (!person?.id) {
		throw AUTH_INVALID;
	}

	const { userkey: userkey } = await sessionRepo.createSession({
		person: person.id,
		ip: ip,
		agentData: agentData,
	});
	//TODO enforce limits

	return {person,token: userkey};
}

function generateCSRFToken(userkey){
	return crypto
        .createHmac('sha256',userkey)
        .digest('hex');
}

export const AUTH_INVALID = Symbol('AUTH_INVALID');
export function getAuthCookieOptions() {
	const secure = process.env.NODE_ENV === 'production';
	return {
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: '/',
	};
};
export function getCSRFCookieOptions() {
	const secure = process.env.NODE_ENV === 'production';
	return {
		httpOnly: false,
		secure,
		sameSite: 'lax',
		path: '/',
	};
}

export default {
	login,
	getAuthCookieOptions,
	getCSRFCookieOptions,
	generateCSRFToken,
};