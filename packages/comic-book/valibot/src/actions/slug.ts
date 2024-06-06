// TODO: Re-export from shared package
import { SLUG_REGEX } from '@/regex';

import * as v from 'valibot';

export function slug<TInput extends string>(): v.RegexAction<TInput, undefined>;

export function slug<
	TInput extends string,
	const TMessage extends v.ErrorMessage<v.RegexIssue<TInput>> | undefined,
>(message: TMessage): v.RegexAction<TInput, TMessage>;

export function slug(
	message?: v.ErrorMessage<v.RegexIssue<string>>,
): v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined> {
	return v.regex(SLUG_REGEX, message);
}
