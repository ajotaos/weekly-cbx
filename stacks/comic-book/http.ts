import { ComicBookDynamodb } from './dynamodb';

import { pathsFactory } from '../utils/paths';
import { permission } from '../utils/permissions';
import { resourceIdFactory } from '../utils/resources';

import * as sst from 'sst/constructs';

export function ComicBookHttp(context: sst.StackContext) {
	const comicBookDynamodb = sst.use(ComicBookDynamodb);

	const createPublisherFn = new sst.Function(
		context.stack,
		resourceId('CreatePublisherFn'),
		{
			handler: paths.makeFunctionPath('create-publisher'),
			permissions: [permission(comicBookDynamodb.table, 'grantReadWriteData')],
			environment: {
				DYNAMODB_TABLE_NAME: comicBookDynamodb.table.tableName,
			},
			logRetention: 'one_month',
		},
	);

	const createSeriesFn = new sst.Function(
		context.stack,
		resourceId('CreateSeriesFn'),
		{
			handler: paths.makeFunctionPath('create-series'),
			permissions: [permission(comicBookDynamodb.table, 'grantReadWriteData')],
			environment: {
				DYNAMODB_TABLE_NAME: comicBookDynamodb.table.tableName,
			},
			logRetention: 'one_month',
		},
	);

	const createIssueFn = new sst.Function(
		context.stack,
		resourceId('CreateIssueFn'),
		{
			handler: paths.makeFunctionPath('create-issue'),
			permissions: [permission(comicBookDynamodb.table, 'grantReadWriteData')],
			environment: {
				DYNAMODB_TABLE_NAME: comicBookDynamodb.table.tableName,
			},
			logRetention: 'one_month',
		},
	);

	const api = new sst.Api(context.stack, resourceId('Api'), {
		routes: {
			'POST /publishers': createPublisherFn,
			'POST /series': createSeriesFn,
			'POST /issues': createIssueFn,
		},
	});

	context.stack.addOutputs({
		[resourceId('ApiUrl')]: api.url,
	});

	return {
		api: api.cdk.httpApi,
	};
}

const resourceId = resourceIdFactory(ComicBookHttp.name);
const paths = pathsFactory('comic-book', 'http');
