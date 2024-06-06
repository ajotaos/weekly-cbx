import { resourceIdFactory } from '../utils/resources';

import * as sst from 'sst/constructs';

import * as cdk from 'aws-cdk-lib';

export function ComicBookIdempotency(context: sst.StackContext) {
	const table = new sst.Table(context.stack, resourceId('Table'), {
		fields: {
			Pk: 'string',
		},
		primaryIndex: { partitionKey: 'Pk' },
		timeToLiveAttribute: 'Expiration',
		cdk: {
			table: {
				removalPolicy: cdk.RemovalPolicy.DESTROY,
			},
		},
	});

	return {
		table: table.cdk.table,
	};
}

const resourceId = resourceIdFactory(ComicBookIdempotency.name);
