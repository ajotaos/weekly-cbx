import { issueTableItemKeys, issueUpdatePagesTableItemKeys } from '@/keys';

import { hexid } from '#/utils/hexid';

import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import * as v from 'valibot';

import type { IssueRawTableItem, IssueUpdatePagesRawTableItem } from '@/types';

import type {
	DynamoDBClient,
	TransactWriteItem,
} from '@aws-sdk/client-dynamodb';

export type UpdateIssueItemPagesInTableProps = {
	id: string;
	pageIds: Array<string>;
};

export async function updateIssueItemPagesInTable(
	props: UpdateIssueItemPagesInTableProps,
	tableName: string,
	client: DynamoDBClient,
) {
	const { id, pageIds } = parseIssueProps(props);

	const transactItems: Array<TransactWriteItem> = [];

	const issueItemKey = {
		Pk: issueTableItemKeys.makePk({ id }),
		Sk: issueTableItemKeys.makeSk(),
	} satisfies Pick<IssueRawTableItem, 'Pk' | 'Sk'>;

	const pages = {
		State: 'fulfilled',
		Ids: pageIds,
	} satisfies Extract<IssueRawTableItem['Pages'], { State: 'fulfilled' }>;

	transactItems.push({
		Update: {
			TableName: tableName,
			Key: marshall(issueItemKey),
			ExpressionAttributeNames: {
				'#Pk': 'Pk',
				'#Pages': 'Pages',
			},
			ExpressionAttributeValues: marshall({
				':pages': pages,
			}),
			UpdateExpression: 'SET #Pages = :pages',
			ConditionExpression: 'attribute_exists(#Pk) AND #Pages <> :pages',
		},
	});

	const operationNonce = hexid();

	const updateIssuePagesOperationItem = {
		Pk: issueUpdatePagesTableItemKeys.makePk({ id }),
		Sk: issueUpdatePagesTableItemKeys.makeSk({ nonce: operationNonce }),
		Kind: 'update-pages',
		Issue: {
			Id: id,
			Pages: pages,
		},
		Nonce: operationNonce,
		Expiration: Math.ceil(Date.now() / 1_000) + 60 * 60 * 24,
	} satisfies IssueUpdatePagesRawTableItem;

	transactItems.push({
		Put: {
			TableName: tableName,
			Item: marshall(updateIssuePagesOperationItem),
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
}

function parseIssueProps(input: unknown) {
	return v.parse(issuePropsSchema, input, {
		abortEarly: true,
		abortPipeEarly: true,
	});
}

const issuePropsSchema = v.object({
	id: v.pipe(v.string(), v.ulid()),
	pageIds: v.array(v.pipe(v.string(), v.hexadecimal(), v.length(8))),
});
