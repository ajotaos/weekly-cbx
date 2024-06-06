import { tableItem, tableItemKey } from '#/utils/dynamodb';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const issueTableItemSchema = tableItem(
	v.object({
		Pk: tableItemKey(
			v.strictTuple([
				v.literal('issues'),
				v.literal('id'),
				v.pipe(v.string(), v.ulid()),
			]),
		),
		Sk: tableItemKey(v.strictTuple([v.literal('#')])),
		Gsi1Pk: tableItemKey(
			v.strictTuple([
				v.literal('issues'),
				v.literal('slug'),
				v.pipe(v.string(), vx.slug()),
			]),
		),
		Gsi1Sk: tableItemKey(v.strictTuple([v.literal('#')])),
		Gsi2Pk: tableItemKey(
			v.strictTuple([
				v.literal('issues'),
				v.literal('series-id'),
				v.pipe(v.string(), v.ulid()),
			]),
		),
		Gsi2Sk: tableItemKey(
			v.strictTuple([v.literal('slug'), v.pipe(v.string(), vx.slug())]),
		),
		Gsi3Pk: tableItemKey(
			v.strictTuple([
				v.literal('issues'),
				v.literal('release-date'),
				v.pipe(v.string(), v.isoDate()),
			]),
		),
		Gsi3Sk: tableItemKey(
			v.strictTuple([v.literal('slug'), v.pipe(v.string(), vx.slug())]),
		),
		Id: v.pipe(v.string(), v.ulid()),
		Title: v.object({
			Publisher: v.pipe(v.string(), vx.publisherName()),
			Series: v.pipe(v.string(), vx.seriesName()),
			Number: v.pipe(v.string(), vx.issueNumber()),
		}),
		Slug: v.pipe(v.string(), vx.slug()),
		SeriesId: v.pipe(v.string(), v.ulid()),
		ReleaseDate: v.pipe(v.string(), v.isoDate()),
		Pages: v.union([
			v.object({
				State: v.literal('pending'),
				Url: v.pipe(v.string(), v.url()),
			}),
			v.object({
				State: v.literal('fulfilled'),
				Ids: v.array(v.pipe(v.string(), v.hexadecimal(), v.length(8))),
			}),
		]),
	}),
);

export type IssueRawTableItem = v.InferInput<typeof issueTableItemSchema>;
export type IssueTableItem = v.InferOutput<typeof issueTableItemSchema>;
