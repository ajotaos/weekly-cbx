import type * as v from 'valibot';

import type { Jsonifiable } from 'type-fest';

export function stepFunctionsEvent<
	TStateSchema extends v.GenericSchema<Jsonifiable>,
>(stateSchema: TStateSchema) {
	return stateSchema;
}
