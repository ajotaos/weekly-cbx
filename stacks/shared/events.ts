import { resourceIdFactory } from '../utils/resources';

import * as sst from 'sst/constructs';

import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

export function SharedEvents(context: sst.StackContext) {
	const eventBus = new sst.EventBus(context.stack, resourceId('EventBus'), {
		cdk: {
			eventBus: events.EventBus.fromEventBusName(
				context.stack,
				'ImportedEventBus',
				'default',
			),
		},
	});

	const connection = new events.Connection(
		context.stack,
		resourceId('Connection'),
		{
			authorization: events.Authorization.basic(
				'username',
				cdk.SecretValue.unsafePlainText('password'),
			),
		},
	);

	return {
		eventBus: eventBus.cdk.eventBus,
		connection,
	};
}

const resourceId = resourceIdFactory(SharedEvents.name);
