import { environment } from './types/env';
import { recordSchema } from './types/record';

import { createExtractor } from './extractor';

import { updateIssueItemPagesInTable } from '#/dynamodb';
import { putIssuePageObjectInBucket } from '#/s3';

import { Idempotency, makeSqs } from '#/utils/functions';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

import axios from 'axios';

import type { Readable } from 'node:stream';

const dynamodbClient = new DynamoDBClient({ region: environment.AWS_REGION });
const s3Client = new S3Client({ region: environment.AWS_REGION });

const idempotency = new Idempotency({
	tableName: environment.IDEMPOTENCY_TABLE_NAME,
	options: {
		eventKeyJmesPath: '"body"."issue"."id"',
		expiresAfterSeconds: 180,
	},
});

export const main = makeSqs(recordSchema)
	.idempotent(idempotency)
	.handler(async (record) => {
		try {
			const response = await axios.get<Readable>(record.body.issue.pages.url, {
				responseType: 'stream',
			});
			const extractor = await createExtractor({ body: response.data });

			const pageIds: Array<string> = [];

			for await (const file of extractor.files()) {
				try {
					const { object } = await putIssuePageObjectInBucket(
						{
							issueId: record.body.issue.id,
							body: file.stream(),
						},
						environment.S3_BUCKET_NAME,
						s3Client,
					);

					pageIds.push(object.id);
				} catch (error) {
					console.log(error);
				}
			}

			await updateIssueItemPagesInTable(
				{
					id: record.body.issue.id,
					pageIds,
				},
				environment.DYNAMODB_TABLE_NAME,
				dynamodbClient,
			);
		} catch (error) {
			console.error(error);

			throw error;
		}
	});
