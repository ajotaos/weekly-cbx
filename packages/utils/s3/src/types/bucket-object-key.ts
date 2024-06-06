import * as v from 'valibot';

export function bucketObjectKey<
	TSchema extends v.StrictTupleSchema<
		Array<v.GenericSchema<string>>,
		undefined
	>,
>(schema: TSchema) {
	return v.pipe(
		v.string(),
		v.transform((value) => value.split('/')),
		schema,
	);
}
