import { PUBLISHER_TITLE_REGEX } from '@/regex';

import * as v from 'valibot';

export function publisherTitle<TInput extends string>(): v.RegexAction<
	TInput,
	undefined
>;

export function publisherTitle<
	TInput extends string,
	const TMessage extends v.ErrorMessage<v.RegexIssue<TInput>> | undefined,
>(message: TMessage): v.RegexAction<TInput, TMessage>;

export function publisherTitle(
	message?: v.ErrorMessage<v.RegexIssue<string>>,
): v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined> {
	return v.regex(PUBLISHER_TITLE_REGEX, message);
}
