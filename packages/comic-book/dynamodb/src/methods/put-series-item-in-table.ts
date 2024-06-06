import {
	publisherTableItemKeys,
	seriesTableItemKeys,
	seriesUniqueSlugTableItemKeys,
} from '@/keys';

import { slugifySeriesTitle } from '@/slug';

import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { ulid } from 'ulidx';

import * as v from 'valibot';
import * as vx from '#/valibot';

import type {
	PublisherRawTableItem,
	SeriesRawTableItem,
	SeriesUniqueSlugRawTableItem,
} from '@/types';

import type {
	DynamoDBClient,
	TransactWriteItem,
} from '@aws-sdk/client-dynamodb';

export type PutSeriesItemInTableProps = {
	title: string;
	publisherId: string;
	releaseDate: string;
};

export async function putSeriesItemInTable(
	props: PutSeriesItemInTableProps,
	tableName: string,
	client: DynamoDBClient,
) {
	const { title, publisherId, releaseDate } = parseSeriesProps(props);

	const transactItems: Array<TransactWriteItem> = [];

	const publisherItemKey = {
		Pk: publisherTableItemKeys.makePk({ id: publisherId }),
		Sk: publisherTableItemKeys.makeSk(),
	} satisfies Pick<PublisherRawTableItem, 'Pk' | 'Sk'>;

	transactItems.push({
		ConditionCheck: {
			TableName: tableName,
			Key: marshall(publisherItemKey),
			ExpressionAttributeNames: {
				'#Pk': 'Pk',
				'#Title': 'Title',
				'#Name': 'Name',
			},
			ExpressionAttributeValues: marshall({
				':titleName': title.publisher,
			}),
			ConditionExpression:
				'attribute_exists(#Pk) AND #Title.#Name = :titleName',
		},
	});

	const id = ulid();
	const slug = slugifySeriesTitle(title);

	const seriesItem = {
		Pk: seriesTableItemKeys.makePk({ id }),
		Sk: seriesTableItemKeys.makeSk(),
		Gsi1Pk: seriesTableItemKeys.makeGsi1Pk({ slug }),
		Gsi1Sk: seriesTableItemKeys.makeGsi1Sk(),
		Gsi2Pk: seriesTableItemKeys.makeGsi2Pk({ publisherId }),
		Gsi2Sk: seriesTableItemKeys.makeGsi2Sk({ slug }),
		Gsi3Pk: seriesTableItemKeys.makeGsi3Pk({ releaseDate }),
		Gsi3Sk: seriesTableItemKeys.makeGsi3Sk({ slug }),
		Id: id,
		Slug: slug,
		Title: {
			Publisher: title.publisher,
			Name: title.name,
		},
		PublisherId: publisherId,
		ReleaseDate: releaseDate,
	} satisfies SeriesRawTableItem;

	transactItems.push({
		Put: {
			TableName: tableName,
			Item: marshall(seriesItem),
			ExpressionAttributeNames: {
				'#Pk': 'Pk',
			},
			ConditionExpression: 'attribute_not_exists(#Pk)',
		},
	});

	const seriesUniqueSlugItem = {
		Pk: seriesUniqueSlugTableItemKeys.makePk({ slug }),
		Sk: seriesUniqueSlugTableItemKeys.makeSk(),
		Id: id,
		Slug: slug,
	} satisfies SeriesUniqueSlugRawTableItem;

	transactItems.push({
		Put: {
			TableName: tableName,
			Item: marshall(seriesUniqueSlugItem),
			ExpressionAttributeNames: {
				'#Pk': 'Pk',
			},
			ConditionExpression: 'attribute_not_exists(#Pk)',
		},
	});

	await client.send(
		new TransactWriteItemsCommand({
			TransactItems: transactItems,
		}),
	);

	return { item: { id } };
}

function parseSeriesProps(input: unknown) {
	return v.parse(seriesPropsSchema, input, {
		abortEarly: true,
		abortPipeEarly: true,
	});
}

const seriesPropsSchema = v.object({
	title: v.pipe(
		v.string(),
		vx.seriesTitle(),
		vx.toSeriesTitleParts(),
		v.object({
			publisher: v.pipe(v.string(), vx.publisherName()),
			name: v.pipe(v.string(), vx.seriesName()),
		}),
	),
	publisherId: v.pipe(v.string(), v.ulid()),
	releaseDate: v.pipe(v.string(), v.isoDate()),
});
