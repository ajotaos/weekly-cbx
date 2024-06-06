import { parseEnvironment } from '#/utils/env';

import * as v from 'valibot';

export const environment = parseEnvironment(
	v.object({
		AWS_REGION: v.pipe(v.string(), v.minLength(1)),
		DYNAMODB_TABLE_NAME: v.pipe(v.string(), v.minLength(1)),
	}),
	{
		abortEarly: true,
		abortPipeEarly: true,
	},
);
