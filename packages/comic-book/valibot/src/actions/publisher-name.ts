import { PUBLISHER_NAME_REGEX } from '@/regex';

import * as v from 'valibot';

export function publisherName<TInput extends string>(): v.RegexAction<
	TInput,
	undefined
>;

export function publisherName<
	TInput extends string,
	const TMessage extends v.ErrorMessage<v.RegexIssue<TInput>> | undefined,
>(message: TMessage): v.RegexAction<TInput, TMessage>;

export function publisherName(
	message?: v.ErrorMessage<v.RegexIssue<string>>,
): v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined> {
	return v.regex(PUBLISHER_NAME_REGEX, message);
}
