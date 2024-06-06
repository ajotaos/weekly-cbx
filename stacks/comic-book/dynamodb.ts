import { resourceIdFactory } from '../utils/resources';

import * as sst from 'sst/constructs';

import * as cdk from 'aws-cdk-lib';

export function ComicBookDynamodb(context: sst.StackContext) {
	const table = new sst.Table(context.stack, resourceId('Table'), {
		fields: {
			Pk: 'string',
			Sk: 'string',
			Gsi1Pk: 'string',
			Gsi1Sk: 'string',
			Gsi2Pk: 'string',
			Gsi2Sk: 'string',
			Gsi3Pk: 'string',
			Gsi3Sk: 'string',
		},
		primaryIndex: {
			partitionKey: 'Pk',
			sortKey: 'Sk',
		},
		globalIndexes: {
			Gsi1: {
				partitionKey: 'Gsi1Pk',
				sortKey: 'Gsi1Sk',
			},
			Gsi2: {
				partitionKey: 'Gsi2Pk',
				sortKey: 'Gsi2Sk',
			},
			Gsi3: {
				partitionKey: 'Gsi3Pk',
				sortKey: 'Gsi3Sk',
			},
		},
		timeToLiveAttribute: 'Expiration',
		stream: 'new_and_old_images',
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

const resourceId = resourceIdFactory(ComicBookDynamodb.name);
