import { ISSUE_NUMBER_REGEX } from '@/regex';

import * as v from 'valibot';

export function issueNumber<TInput extends string>(): v.RegexAction<
	TInput,
	undefined
>;

export function issueNumber<
	TInput extends string,
	const TMessage extends v.ErrorMessage<v.RegexIssue<TInput>> | undefined,
>(message: TMessage): v.RegexAction<TInput, TMessage>;

export function issueNumber(
	message?: v.ErrorMessage<v.RegexIssue<string>>,
): v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined> {
	return v.regex(ISSUE_NUMBER_REGEX, message);
}
