import { sqsRecord } from '#/utils/functions';

import * as v from 'valibot';

export const recordSchema = sqsRecord(
	v.object({
		issue: v.object({
			id: v.pipe(v.string(), v.ulid()),
			pages: v.object({
				url: v.pipe(v.string(), v.url()),
			}),
		}),
	}),
);
