import type { z } from 'zod';
import { HomepageAd as HomepageAdSchema } from '../schemas/Ad.ts';

export const HomepageAdExample = [
	{
		url: 'https://example.com',
		imgSrc: 'https://example.com/ad.jpg',
		background: '#FFFFFF',
	},
] satisfies Array<z.output<typeof HomepageAdSchema>>;