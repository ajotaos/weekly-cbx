import { PUBLISHER_TITLE_PARTS_REGEX } from '@/regex';

import * as v from 'valibot';

export type PublisherTitleParts = {
	name: string;
};

export function toPublisherTitleParts(): v.TransformAction<
	string,
	PublisherTitleParts
> {
	return v.transform(
		(value) =>
			PUBLISHER_TITLE_PARTS_REGEX.exec(value)?.groups as PublisherTitleParts,
	);
}
