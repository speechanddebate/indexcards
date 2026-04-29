import z from 'zod';

export const HomepageAd = z.object({
	url: z.url().meta({
		description: 'The URL that the ad should link to when clicked',
	}),
	imgSrc: z.url().meta({
		description: 'The source URL of the image to be displayed in the ad',
	}),
	background: z.string().optional().meta({
		description: 'Optional background color for the ad, in hex format (e.g., #FFFFFF)',
	}),
}).meta({
	id: 'HomepageAd',
	description: 'An ad to be displayed on the homepage',
}
);