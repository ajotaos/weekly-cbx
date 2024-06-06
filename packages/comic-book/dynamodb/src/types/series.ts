import { tableItem, tableItemKey } from '#/utils/dynamodb';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const seriesTableItemSchema = tableItem(
	v.object({
		Pk: tableItemKey(
			v.strictTuple([
				v.literal('series'),
				v.literal('id'),
				v.pipe(v.string(), v.ulid()),
			]),
		),
		Sk: tableItemKey(v.strictTuple([v.literal('#')])),
		Gsi1Pk: tableItemKey(
			v.strictTuple([
				v.literal('series'),
				v.literal('slug'),
				v.pipe(v.string(), vx.slug()),
			]),
		),
		Gsi1Sk: tableItemKey(v.strictTuple([v.literal('#')])),
		Gsi2Pk: tableItemKey(
			v.strictTuple([
				v.literal('series'),
				v.literal('publisher-id'),
				v.pipe(v.string(), v.ulid()),
			]),
		),
		Gsi2Sk: tableItemKey(
			v.strictTuple([v.literal('slug'), v.pipe(v.string(), vx.slug())]),
		),
		Gsi3Pk: tableItemKey(
			v.strictTuple([
				v.literal('series'),
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
			Name: v.pipe(v.string(), vx.seriesName()),
		}),
		Slug: v.pipe(v.string(), vx.slug()),
		PublisherId: v.pipe(v.string(), v.ulid()),
		ReleaseDate: v.pipe(v.string(), v.isoDate()),
	}),
);

export type SeriesRawTableItem = v.InferInput<typeof seriesTableItemSchema>;
export type SeriesTableItem = v.InferOutput<typeof seriesTableItemSchema>;
