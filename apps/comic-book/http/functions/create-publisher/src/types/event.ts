import { apiGatewayEvent } from '#/utils/functions';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const eventSchema = apiGatewayEvent(
	v.object({
		title: v.pipe(v.string(), vx.publisherTitle()),
	}),
	v.any(),
	v.any(),
);
