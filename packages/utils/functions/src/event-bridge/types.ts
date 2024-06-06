import * as v from 'valibot';

import type { Jsonifiable } from 'type-fest';

export function eventBridgeEvent<
	TDetailSchema extends v.GenericSchema<Jsonifiable>,
	TDetailTypeSchema extends v.GenericSchema<string>,
	TSource extends v.GenericSchema<string>,
>(
	detailSchema: TDetailSchema,
	detailTypeSchema: TDetailTypeSchema,
	sourceSchema: TSource,
) {
	return v.object({
		...eventBridgeEventSchema.entries,
		source: sourceSchema,
		'detail-type': detailTypeSchema,
		detail: detailSchema,
	});
}

export function s3EventNotificationEventBridgeEvent<
	TDetailTypeSchema extends v.GenericSchema<string>,
>(detailTypeSchema: TDetailTypeSchema) {
	return eventBridgeEvent(
		s3EventNotificationEventBridgeEventSchema,
		detailTypeSchema,
		v.literal('aws.s3'),
	);
}

export const eventBridgeEventSchema = v.object({
	version: v.string(),
	Id: v.string(),
	source: v.string(),
	account: v.string(),
	time: v.pipe(v.string(), v.isoTimestamp()),
	region: v.string(),
	resources: v.array(v.string()),
	'detail-type': v.string(),
	detail: v.unknown(),
	'replay-name': v.optional(v.string()),
});

export const s3EventNotificationEventBridgeEventSchema = v.object({
	version: v.string(),
	bucket: v.object({
		name: v.string(),
	}),
	object: v.object({
		key: v.string(),
		size: v.optional(v.pipe(v.number(), v.minValue(0))), // not present in DeleteObject events
		etag: v.optional(v.string()), // not present in DeleteObject events
		'version-id': v.optional(v.string()),
		sequencer: v.optional(v.string()),
	}),
	'request-id': v.string(),
	requester: v.string(),
	'source-ip-address': v.optional(v.pipe(v.string(), v.ip())),
	reason: v.optional(v.string()),
	'deletion-type': v.optional(v.string()),
	'restore-expiry-time': v.optional(v.string()),
	'source-storage-class': v.optional(v.string()),
	'destination-storage-class': v.optional(v.string()),
	'destination-access-tier': v.optional(v.string()),
});

export type BaseEventBridgeEvent = v.InferOutput<typeof eventBridgeEventSchema>;
