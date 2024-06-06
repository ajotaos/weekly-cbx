import * as v from 'valibot';

export function tableItemKey<
	TSchema extends v.StrictTupleSchema<
		Array<v.GenericSchema<string>>,
		undefined
	>,
>(schema: TSchema) {
	return v.pipe(
		v.string(),
		v.endsWith(':'),
		v.transform((value) => value.slice(0, -1).split(':')),
		schema,
	);
}
