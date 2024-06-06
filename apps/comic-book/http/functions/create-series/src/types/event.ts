import { apiGatewayEvent } from '#/utils/functions';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const eventSchema = apiGatewayEvent(
	v.object({
		title: v.pipe(v.string(), vx.seriesTitle()),
		publisherId: v.pipe(v.string(), v.ulid()),
		releaseDate: v.pipe(v.string(), v.isoDate()),
	}),
	v.any(),
	v.any(),
);
