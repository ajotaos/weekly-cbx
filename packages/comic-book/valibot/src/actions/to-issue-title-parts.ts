import { ISSUE_TITLE_PARTS_REGEX } from '@/regex';

import * as v from 'valibot';

export type IssueTitleParts = {
	publisher: string;
	series: string;
	number: string;
};

export function toIssueTitleParts(): v.TransformAction<
	string,
	IssueTitleParts
> {
	return v.transform(
		(value) => ISSUE_TITLE_PARTS_REGEX.exec(value)?.groups as IssueTitleParts,
	);
}
