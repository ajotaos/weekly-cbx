import { SERIES_TITLE_REGEX } from '@/regex';

import * as v from 'valibot';

export function seriesTitle<TInput extends string>(): v.RegexAction<
	TInput,
	undefined
>;

export function seriesTitle<
	TInput extends string,
	const TMessage extends v.ErrorMessage<v.RegexIssue<TInput>> | undefined,
>(message: TMessage): v.RegexAction<TInput, TMessage>;

export function seriesTitle(
	message?: v.ErrorMessage<v.RegexIssue<string>>,
): v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined> {
	return v.regex(SERIES_TITLE_REGEX, message);
}
