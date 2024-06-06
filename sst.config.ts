import {
	ComicBookDynamodb,
	ComicBookEvents,
	ComicBookHttp,
	ComicBookIdempotency,
	ComicBookPages,
	ComicBookS3,
} from './stacks/comic-book';

import { SharedEvents } from './stacks/shared';

import type { SSTConfig } from 'sst';

export default {
	config(_input) {
		return {
			name: 'weekly-cbx',
			region: 'us-east-1',
		};
	},
	stacks(app) {
		// Remove all resources when the dev stage is removed
		if (app.stage === 'dev') {
			app.setDefaultRemovalPolicy('destroy');
		}

		app
			.stack(SharedEvents)
			.stack(ComicBookDynamodb)
			.stack(ComicBookS3)
			.stack(ComicBookEvents)
			.stack(ComicBookIdempotency)
			.stack(ComicBookPages)
			.stack(ComicBookHttp);
	},
} satisfies SSTConfig;
