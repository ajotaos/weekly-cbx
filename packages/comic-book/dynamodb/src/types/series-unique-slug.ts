import { tableItem, tableItemKey } from '#/utils/dynamodb';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const seriesUniqueSlugTableItemSchema = tableItem(
	v.object({
		Pk: tableItemKey(
			v.strictTuple([
				v.literal('series'),
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

export type SeriesUniqueSlugRawTableItem = v.InferInput<
	typeof seriesUniqueSlugTableItemSchema
>;
export type SeriesUniqueSlugTableItem = v.InferOutput<
	typeof seriesUniqueSlugTableItemSchema
>;
