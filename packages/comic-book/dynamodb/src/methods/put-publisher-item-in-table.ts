import {
	publisherTableItemKeys,
	publisherUniqueSlugTableItemKeys,
} from '@/keys';

import { slugifyPublisherTitle } from '@/slug';

import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { ulid } from 'ulidx';

import * as v from 'valibot';
import * as vx from '#/valibot';

import type {
	PublisherRawTableItem,
	PublisherUniqueSlugRawTableItem,
} from '@/types';

import type {
	DynamoDBClient,
	TransactWriteItem,
} from '@aws-sdk/client-dynamodb';

export type PutPublisherItemInTableProps = {
	title: string;
};

export async function putPublisherItemInTable(
	props: PutPublisherItemInTableProps,
	tableName: string,
	client: DynamoDBClient,
) {
	const { title } = parsePublisherProps(props);

	const id = ulid();
	const slug = slugifyPublisherTitle(title);

	const transactItems: Array<TransactWriteItem> = [];

	const publisherItem = {
		Pk: publisherTableItemKeys.makePk({ id }),
		Sk: publisherTableItemKeys.makeSk(),
		Gsi1Pk: publisherTableItemKeys.makeGsi1Pk({ slug }),
		Gsi1Sk: publisherTableItemKeys.makeGsi1Sk(),
		Gsi2Pk: publisherTableItemKeys.makeGsi2Pk(),
		Gsi2Sk: publisherTableItemKeys.makeGsi2Sk({ slug }),
		Id: id,
		Slug: slug,
		Title: {
			Name: title.name,
		},
	} satisfies PublisherRawTableItem;

	transactItems.push({
		Put: {
			TableName: tableName,
			Item: marshall(publisherItem),
			ExpressionAttributeNames: {
				'#Pk': 'Pk',
			},
			ConditionExpression: 'attribute_not_exists(#Pk)',
		},
	});

	const publisherUniqueSlugItem = {
		Pk: publisherUniqueSlugTableItemKeys.makePk({ slug }),
		Sk: publisherUniqueSlugTableItemKeys.makeSk(),
		Id: id,
		Slug: slug,
	} satisfies PublisherUniqueSlugRawTableItem;

	transactItems.push({
		Put: {
			TableName: tableName,
			Item: marshall(publisherUniqueSlugItem),
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

function parsePublisherProps(input: unknown) {
	return v.parse(publisherPropsSchema, input, {
		abortEarly: true,
		abortPipeEarly: true,
	});
}

const publisherPropsSchema = v.object({
	title: v.pipe(
		v.string(),
		vx.publisherTitle(),
		vx.toPublisherTitleParts(),
		v.object({
			name: v.pipe(v.string(), vx.publisherName()),
		}),
	),
});
