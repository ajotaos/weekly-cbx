import { SERIES_TITLE_PARTS_REGEX } from '@/regex';

import * as v from 'valibot';

export type SeriesTitleParts = {
	publisher: string;
	name: string;
};

export function toSeriesTitleParts(): v.TransformAction<
	string,
	SeriesTitleParts
> {
	return v.transform(
		(value) => SERIES_TITLE_PARTS_REGEX.exec(value)?.groups as SeriesTitleParts,
	);
}
