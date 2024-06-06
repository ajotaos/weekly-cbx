import { tableItem, tableItemKey } from '#/utils/dynamodb';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const publisherTableItemSchema = tableItem(
	v.object({
		Pk: tableItemKey(
			v.strictTuple([
				v.literal('publishers'),
				v.literal('id'),
				v.pipe(v.string(), v.ulid()),
			]),
		),
		Sk: tableItemKey(v.strictTuple([v.literal('#')])),
		Gsi1Pk: tableItemKey(
			v.strictTuple([
				v.literal('publishers'),
				v.literal('slug'),
				v.pipe(v.string(), vx.slug()),
			]),
		),
		Gsi1Sk: tableItemKey(v.strictTuple([v.literal('#')])),
		Gsi2Pk: tableItemKey(v.strictTuple([v.literal('publishers')])),
		Gsi2Sk: tableItemKey(
			v.strictTuple([v.literal('slug'), v.pipe(v.string(), vx.slug())]),
		),
		Id: v.pipe(v.string(), v.ulid()),
		Title: v.object({
			Name: v.pipe(v.string(), vx.publisherName()),
		}),
		Slug: v.pipe(v.string(), vx.slug()),
	}),
);

export type PublisherRawTableItem = v.InferInput<
	typeof publisherTableItemSchema
>;
export type PublisherTableItem = v.InferOutput<typeof publisherTableItemSchema>;
