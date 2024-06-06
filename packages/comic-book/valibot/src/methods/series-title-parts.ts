import { publisherName, seriesName } from '@/actions';

import * as v from 'valibot';

export function seriesTitleParts() {
	return v.object({
		publisher: v.pipe(v.string(), publisherName()),
		name: v.pipe(v.string(), seriesName()),
	});
}

export type SeriesTitleParts = v.InferOutput<
	ReturnType<typeof seriesTitleParts>
>;
