import middy from '@middy/core';

import * as v from 'valibot';

import type { Context } from 'aws-lambda';

import type { Jsonifiable } from 'type-fest';

export function makeStepFunctions<
	TEventSchema extends v.GenericSchema<Jsonifiable>,
>(eventSchema: TEventSchema) {
	type Handler<TResult extends Jsonifiable> = (
		record: v.InferOutput<TEventSchema>,
		context: Context,
	) => Promise<TResult>;

	return {
		handler<TResult extends Jsonifiable>(handler: Handler<TResult>) {
			return middy().use(eventValidator(eventSchema)).handler(handler);
		},
	};
}

function eventValidator<TSchema extends v.GenericSchema<Jsonifiable>>(
	schema: TSchema,
): middy.MiddlewareObj<v.InferOutput<TSchema>> {
	return {
		before(request) {
			request.event = v.parse(schema, request.event, {
				abortEarly: true,
				abortPipeEarly: true,
			});
		},
	};
}
