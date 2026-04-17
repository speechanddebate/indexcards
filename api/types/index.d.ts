declare global {
	namespace Express {
		interface Request {
			authType?: 'basic' | 'bearer' | 'cookie';
			csrfToken?: string;
			session?: {
				id?: number;
				person?: number;
				su?: number | null;
				Su?: unknown | null;
				Person?: unknown | null;
				perms?: Record<string, unknown>;
				tourn?: unknown;
				[key: string]: unknown;
			};
			person?: unknown;
			actor?: Actor;
		}
	}
}
type Actor = {
	id: number;
	Person: unknown;
	type: 'person';
	can: (record: string, action: string, scope: string, id?: number) => boolean;
	assert: (record: string, action: string, scope: string, id?: number) => void;
	allowedIds: (resource: string, action: string, opts: Record<string, unknown>) => {
		ids: number[];
		all: boolean;
	};
}

export {};