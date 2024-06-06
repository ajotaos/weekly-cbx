import { resourceIdFactory } from '../utils/resources';

import * as sst from 'sst/constructs';

import * as cdk from 'aws-cdk-lib';

export function ComicBookS3(context: sst.StackContext) {
	const bucket = new sst.Bucket(context.stack, resourceId('Bucket'), {
		cdk: {
			bucket: {
				eventBridgeEnabled: true,
				autoDeleteObjects: true,
				removalPolicy: cdk.RemovalPolicy.DESTROY,
			},
		},
	});

	return {
		bucket: bucket.cdk.bucket,
	};
}

const resourceId = resourceIdFactory(ComicBookS3.name);
