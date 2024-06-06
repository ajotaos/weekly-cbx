import * as v from 'valibot';

import type { Jsonifiable } from 'type-fest';

export function sqsRecord<TBodySchema extends v.GenericSchema<Jsonifiable>>(
	bodySchema: TBodySchema,
) {
	return v.object({
		...sqsRecordSchema.entries,
		body: bodySchema,
	});
}

export const sqsMessageAttributeSchema = v.object({
	stringValue: v.optional(v.string()),
	binaryValue: v.optional(v.string()),
	stringListValues: v.optional(v.array(v.string())),
	binaryListValues: v.optional(v.array(v.string())),
	dataType: v.string(),
});

export const sqsAttributesSchema = v.object({
	ApproximateReceiveCount: v.string(),
	ApproximateFirstReceiveTimestamp: v.string(),
	MessageDeduplicationId: v.optional(v.string()),
	MessageGroupId: v.optional(v.string()),
	SenderId: v.string(),
	SentTimestamp: v.string(),
	SequenceNumber: v.optional(v.string()),
	AWSTraceHeader: v.optional(v.string()),
	/**
	 * Undocumented, but used by AWS to support their re-drive functionality in the console
	 */
	DeadLetterQueueSourceArn: v.optional(v.string()),
});

export const sqsRecordSchema = v.object({
	messageId: v.string(),
	receiptHandle: v.string(),
	body: v.unknown(),
	attributes: sqsAttributesSchema,
	messageAttributes: v.record(v.string(), sqsMessageAttributeSchema),
	md5OfBody: v.string(),
	md5OfMessageAttributes: v.nullish(v.string()),
	eventSource: v.literal('aws:sqs'),
	eventSourceARN: v.string(),
	awsRegion: v.string(),
});

export type BaseSqsRecord = v.InferOutput<typeof sqsRecordSchema>;
