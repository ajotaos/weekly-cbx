import {
	issueTableItemKeys,
	issueUniqueSlugTableItemKeys,
	seriesTableItemKeys,
} from '@/keys';

import { slugifyIssueTitle } from '@/slug';

import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { ulid } from 'ulidx';

import * as v from 'valibot';
import * as vx from '#/valibot';

import type {
	IssueRawTableItem,
	IssueUniqueSlugRawTableItem,
	SeriesRawTableItem,
} from '@/types';

import type {
	DynamoDBClient,
	TransactWriteItem,
} from '@aws-sdk/client-dynamodb';

export type PutIssueItemInTableProps = {
	title: string;
	seriesId: string;
	releaseDate: string;
	pagesUrl: string;
};

export async function putIssueItemInTable(
	props: PutIssueItemInTableProps,
	tableName: string,
	client: DynamoDBClient,
) {
	const { title, seriesId, releaseDate, pagesUrl } = parseIssueProps(props);

	const transactItems: Array<TransactWriteItem> = [];

	const seriesItemKey = {
		Pk: seriesTableItemKeys.makePk({ id: seriesId }),
		Sk: seriesTableItemKeys.makeSk(),
	} satisfies Pick<SeriesRawTableItem, 'Pk' | 'Sk'>;

	transactItems.push({
		ConditionCheck: {
			TableName: tableName,
			Key: marshall(seriesItemKey),
			ExpressionAttributeNames: {
				'#Pk': 'Pk',
				'#Title': 'Title',
				'#Publisher': 'Publisher',
				'#Name': 'Name',
			},
			ExpressionAttributeValues: marshall({
				':titlePublisher': title.publisher,
				':titleName': title.series,
			}),
			ConditionExpression:
				'attribute_exists(#Pk) AND #Title.#Publisher = :titlePublisher AND #Title.#Name = :titleName',
		},
	});

	const id = ulid();
	const slug = slugifyIssueTitle(title);

	const issueItem = {
		Pk: issueTableItemKeys.makePk({ id }),
		Sk: issueTableItemKeys.makeSk(),
		Gsi1Pk: issueTableItemKeys.makeGsi1Pk({ slug }),
		Gsi1Sk: issueTableItemKeys.makeGsi1Sk(),
		Gsi2Pk: issueTableItemKeys.makeGsi2Pk({ seriesId }),
		Gsi2Sk: issueTableItemKeys.makeGsi2Sk({ slug }),
		Gsi3Pk: issueTableItemKeys.makeGsi3Pk({ releaseDate }),
		Gsi3Sk: issueTableItemKeys.makeGsi3Sk({ slug }),
		Id: id,
		Slug: slug,
		Title: {
			Publisher: title.publisher,
			Series: title.series,
			Number: title.number,
		},
		SeriesId: seriesId,
		ReleaseDate: releaseDate,
		Pages: {
			State: 'pending',
			Url: pagesUrl,
		},
	} satisfies IssueRawTableItem;

	transactItems.push({
		Put: {
			TableName: tableName,
			Item: marshall(issueItem),
			ExpressionAttributeNames: {
				'#Pk': 'Pk',
			},
			ConditionExpression: 'attribute_not_exists(#Pk)',
		},
	});

	const issueUniqueSlugItem = {
		Pk: issueUniqueSlugTableItemKeys.makePk({ slug }),
		Sk: issueUniqueSlugTableItemKeys.makeSk(),
		Id: id,
		Slug: slug,
	} satisfies IssueUniqueSlugRawTableItem;

	transactItems.push({
		Put: {
			TableName: tableName,
			Item: marshall(issueUniqueSlugItem),
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

function parseIssueProps(input: unknown) {
	return v.parse(issuePropsSchema, input, {
		abortEarly: true,
		abortPipeEarly: true,
	});
}

const issuePropsSchema = v.object({
	title: v.pipe(
		v.string(),
		vx.issueTitle(),
		vx.toIssueTitleParts(),
		v.object({
			publisher: v.pipe(v.string(), vx.publisherName()),
			series: v.pipe(v.string(), vx.seriesName()),
			number: v.pipe(v.string(), vx.issueNumber()),
		}),
	),
	seriesId: v.pipe(v.string(), v.ulid()),
	releaseDate: v.pipe(v.string(), v.isoDate()),
	pagesUrl: v.pipe(v.string(), v.url()),
});
