import { apiGatewayEvent } from '#/utils/functions';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const eventSchema = apiGatewayEvent(
	v.object({
		title: v.pipe(v.string(), vx.issueTitle()),
		seriesId: v.pipe(v.string(), v.ulid()),
		releaseDate: v.pipe(v.string(), v.isoDate()),
		pagesUrl: v.pipe(v.string(), v.url()),
	}),
	v.any(),
	v.any(),
);
