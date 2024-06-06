import { ComicBookDynamodb } from './dynamodb';
import { ComicBookIdempotency } from './idempotency';
import { ComicBookS3 } from './s3';

import { pathsFactory } from '../utils/paths';
import { permission } from '../utils/permissions';
import { resourceIdFactory } from '../utils/resources';

import * as sst from 'sst/constructs';

import * as cdk from 'aws-cdk-lib';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';

import * as pipes from '@aws-cdk/aws-pipes-alpha';
import * as pipesTargets from '@aws-cdk/aws-pipes-targets-alpha';

import * as pipesSources_ from '../constructs/pipes-sources';

export function ComicBookPages(context: sst.StackContext) {
	const comicBookDynamodb = sst.use(ComicBookDynamodb);
	const comicBookS3 = sst.use(ComicBookS3);
	const comicBookIdempotency = sst.use(ComicBookIdempotency);

	const importIssuePagesQueue = new sqs.Queue(
		context.stack,
		resourceId('ImportIssuePagesQueue'),
		{
			visibilityTimeout: cdk.Duration.minutes(5),
		},
	);

	new pipes.Pipe(context.stack, resourceId('ImportIssuePagesPipe'), {
		source: new pipesSources_.DynamoDBSource(comicBookDynamodb.table, {
			startingPosition: pipesSources_.DynamoDBStartingPosition.TRIM_HORIZON,
		}),
		filter: new pipes.Filter([
			pipes.FilterPattern.fromObject({
				eventName: ['INSERT'],
				dynamodb: {
					NewImage: {
						Pk: {
							S: [{ prefix: 'issues:id:' }],
						},
						Pages: {
							M: {
								State: {
									S: ['pending'],
								},
							},
						},
					},
				},
			}),
		]),
		target: new pipesTargets.SqsTarget(importIssuePagesQueue, {
			inputTransformation: pipes.InputTransformation.fromObject({
				issue: {
					id: pipes.DynamicInput.fromEventPath('$.dynamodb.NewImage.Id.S'),
					pages: {
						url: pipes.DynamicInput.fromEventPath(
							'$.dynamodb.NewImage.Pages.M.Url.S',
						),
					},
				},
			}),
		}),
	});

	const importIssuePagesFn = new sst.Function(
		context.stack,
		resourceId('ImportIssuePagesFn'),
		{
			handler: paths.makeFunctionPath('import-issue-pages'),
			permissions: [
				permission(comicBookDynamodb.table, 'grantWriteData'),
				permission(comicBookS3.bucket, 'grantPut'),
				permission(comicBookIdempotency.table, 'grantReadWriteData'),
			],
			environment: {
				DYNAMODB_TABLE_NAME: comicBookDynamodb.table.tableName,
				S3_BUCKET_NAME: comicBookS3.bucket.bucketName,
				IDEMPOTENCY_TABLE_NAME: comicBookIdempotency.table.tableName,
			},
			timeout: '3 minutes',
		},
	);

	importIssuePagesFn.addEventSource(
		new lambdaEventSources.SqsEventSource(importIssuePagesQueue, {
			batchSize: 5,
			maxConcurrency: 10,
			reportBatchItemFailures: true,
		}),
	);
}

const resourceId = resourceIdFactory(ComicBookPages.name);
const paths = pathsFactory('comic-book', 'pages');
