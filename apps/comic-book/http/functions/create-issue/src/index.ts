import { environment } from './types/env';
import { eventSchema } from './types/event';

import { putIssueItemInTable } from '#/dynamodb';

import { makeApiGateway } from '#/utils/functions';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({ region: environment.AWS_REGION });

export const main = makeApiGateway(eventSchema).handler(async (event) => {
	const { item } = await putIssueItemInTable(
		{
			title: event.body.title,
			seriesId: event.body.seriesId,
			releaseDate: event.body.releaseDate,
			pagesUrl: event.body.pagesUrl,
		},
		environment.DYNAMODB_TABLE_NAME,
		dynamodbClient,
	);

	return {
		statusCode: 200,
		body: {
			issue: { id: item.id },
		},
	};
});
