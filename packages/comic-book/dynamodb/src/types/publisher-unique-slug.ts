import { tableItem, tableItemKey } from '#/utils/dynamodb';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const publisherUniqueSlugTableItemSchema = tableItem(
	v.object({
		Pk: tableItemKey(
			v.strictTuple([
				v.literal('publishers'),
				v.literal('unq'),
				v.literal('slug'),
				v.pipe(v.string(), vx.slug()),
			]),
		),
		Sk: tableItemKey(v.strictTuple([v.literal('#')])),
		Id: v.pipe(v.string(), v.ulid()),
		Slug: v.pipe(v.string(), vx.slug()),
	}),
);

export type PublisherUniqueSlugRawTableItem = v.InferInput<
	typeof publisherUniqueSlugTableItemSchema
>;
export type PublisherUniqueSlugTableItem = v.InferOutput<
	typeof publisherUniqueSlugTableItemSchema
>;
