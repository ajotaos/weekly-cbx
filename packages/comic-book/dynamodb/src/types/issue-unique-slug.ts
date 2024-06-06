import { tableItem, tableItemKey } from '#/utils/dynamodb';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const issueUniqueSlugTableItemSchema = tableItem(
	v.object({
		Pk: tableItemKey(
			v.strictTuple([
				v.literal('issues'),
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

export type IssueUniqueSlugRawTableItem = v.InferInput<
	typeof issueUniqueSlugTableItemSchema
>;
export type IssueUniqueSlugTableItem = v.InferOutput<
	typeof issueUniqueSlugTableItemSchema
>;
