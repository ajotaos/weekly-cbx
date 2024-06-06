import { tableItem, tableItemKey } from '#/utils/dynamodb';

import * as v from 'valibot';

export const issueUpdatePagesTableItemSchema = tableItem(
	v.object({
		Pk: tableItemKey(
			v.strictTuple([
				v.literal('issues'),
				v.literal('upd'),
				v.literal('update-pages'),
			]),
		),
		Sk: tableItemKey(
			v.strictTuple([
				v.literal('nonce'),
				v.pipe(v.string(), v.hexadecimal(), v.length(8)),
			]),
		),
		Kind: v.literal('update-pages'),
		Issue: v.object({
			Id: v.pipe(v.string(), v.ulid()),
			Pages: v.object({
				State: v.literal('fulfilled'),
				Ids: v.array(v.pipe(v.string(), v.hexadecimal(), v.length(8))),
			}),
		}),
		Nonce: v.pipe(v.string(), v.hexadecimal(), v.length(8)),
		Expiration: v.pipe(v.number(), v.integer()),
	}),
);

export type IssueUpdatePagesRawTableItem = v.InferInput<
	typeof issueUpdatePagesTableItemSchema
>;
export type IssueUpdatePagesTableItem = v.InferOutput<
	typeof issueUpdatePagesTableItemSchema
>;
