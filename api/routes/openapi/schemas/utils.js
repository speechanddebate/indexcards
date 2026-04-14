import z from 'zod';

export const id = z.coerce.number().int().positive();
export const TwoLetterCode = z.string().regex(/^[A-Z]{2}$/, 'Must be a valid 2-letter code');