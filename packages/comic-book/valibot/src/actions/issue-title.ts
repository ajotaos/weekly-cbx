import { ISSUE_TITLE_REGEX } from '@/regex';

import * as v from 'valibot';

export function issueTitle<TInput extends string>(): v.RegexAction<
	TInput,
	undefined
>;

export function issueTitle<
	TInput extends string,
	const TMessage extends v.ErrorMessage<v.RegexIssue<TInput>> | undefined,
>(message: TMessage): v.RegexAction<TInput, TMessage>;

export function issueTitle(
	message?: v.ErrorMessage<v.RegexIssue<string>>,
): v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined> {
	return v.regex(ISSUE_TITLE_REGEX, message);
}
