import { resourceIdFactory } from '../utils/resources';

import * as sst from 'sst/constructs';

export function ComicBookEvents(context: sst.StackContext) {
	const eventBus = new sst.EventBus(context.stack, resourceId('EventBus'));

	return {
		eventBus: eventBus.cdk.eventBus,
	};
}

const resourceId = resourceIdFactory(ComicBookEvents.name);
