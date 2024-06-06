import { issueNumber, publisherName, seriesName } from '@/actions';

import * as v from 'valibot';

export function issueTitleParts() {
	return v.object({
		publisher: v.pipe(v.string(), publisherName()),
		series: v.pipe(v.string(), seriesName()),
		number: v.pipe(v.string(), issueNumber()),
	});
}

export type IssueTitleParts = v.InferOutput<ReturnType<typeof issueTitleParts>>;
