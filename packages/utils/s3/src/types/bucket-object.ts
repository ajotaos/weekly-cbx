import * as v from 'valibot';

import { camelKeys } from 'string-ts';

import type { Readable } from 'node:stream';

type BaseBucketObject = {
	Key: string;
	Body: Readable;
	Metadata: Record<string, string>;
};

export function bucketObject<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	TSchema extends v.GenericSchema<BaseBucketObject, any>,
>(schema: TSchema) {
	return v.pipe(schema, v.transform(camelKeys));
}
