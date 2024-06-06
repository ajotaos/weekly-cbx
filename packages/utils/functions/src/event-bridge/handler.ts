import middy from '@middy/core';

import {
	makeIdempotencyConfig,
	makeIdempotencyPersistenceStore,
} from '@/utils/idempotency';
import { makeHandlerIdempotent } from '@aws-lambda-powertools/idempotency/middleware';

import * as v from 'valibot';

import type { BaseEventBridgeEvent } from './types';

import type { Idempotency } from '@/utils/idempotency';

import type { Context } from 'aws-lambda';

export function makeEventBridge<
	TEventSchema extends v.GenericSchema<BaseEventBridgeEvent>,
>(eventSchema: TEventSchema) {
	type Handler = (
		record: v.InferOutput<TEventSchema>,
		context: Context,
	) => Promise<void>;

	return {
		handler(handler: Handler) {
			return middy().use(eventValidator(eventSchema)).handler(handler);
		},
		idempotent(idempotency: Idempotency) {
			const idempotencyPersistenceStore = makeIdempotencyPersistenceStore(
				idempotency.tableName,
			);
			const idempotencyConfig = makeIdempotencyConfig(idempotency.options);

			return {
				handler(handler: Handler) {
					return middy()
						.use(eventValidator(eventSchema))
						.use(
							makeHandlerIdempotent({
								persistenceStore: idempotencyPersistenceStore,
								config: idempotencyConfig,
							}),
						)
						.handler(handler);
				},
			};
		},
	};
}

function eventValidator<TSchema extends v.GenericSchema<BaseEventBridgeEvent>>(
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
