import { environment } from './types/env';
import { eventSchema } from './types/event';

import { putSeriesItemInTable } from '#/dynamodb';

import { makeApiGateway } from '#/utils/functions';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({ region: environment.AWS_REGION });

export const main = makeApiGateway(eventSchema).handler(async (event) => {
	const { item } = await putSeriesItemInTable(
		{
			title: event.body.title,
			publisherId: event.body.publisherId,
			releaseDate: event.body.releaseDate,
		},
		environment.DYNAMODB_TABLE_NAME,
		dynamodbClient,
	);

	return {
		statusCode: 200,
		body: {
			series: { id: item.id },
		},
	};
});
