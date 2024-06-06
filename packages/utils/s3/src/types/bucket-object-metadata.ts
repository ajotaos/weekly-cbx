import * as v from 'valibot';

import { camelKeys } from 'string-ts';

export function bucketObjectMetadata<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	TSchema extends v.GenericSchema<Record<string, string>, any>,
>(schema: TSchema) {
	return v.pipe(
		schema,
		v.transform(stripAmzMetaPrefix),
		v.transform(camelKeys),
	);
}

export type StripAmzMetaPrefixKeys<T> = {
	[K in keyof T & string as K extends `x-amz-meta-${infer U}` ? U : K]: T[K];
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function stripAmzMetaPrefix<T extends Record<string, any>>(
	inputObj: T,
): StripAmzMetaPrefixKeys<T> {
	const result: Record<string, string> = {};

	for (const key in inputObj) {
		if (key.startsWith('x-amz-meta-')) {
			const newKey = key.slice(11);
			result[newKey] = inputObj[key];
		} else {
			result[key] = inputObj[key];
		}
	}

	return result as StripAmzMetaPrefixKeys<T>;
}
