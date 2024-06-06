import { publisherName } from '@/actions';

import * as v from 'valibot';

export function publisherTitleParts() {
	return v.object({
		name: v.pipe(v.string(), publisherName()),
	});
}

export type PublisherTitleParts = v.InferOutput<
	ReturnType<typeof publisherTitleParts>
>;
