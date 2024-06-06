import { IMAGE_DIMENSIONS_META_REGEX } from '@/regex';

import * as v from 'valibot';

export function imageDimensionsMeta<TInput extends string>(): v.RegexAction<
	TInput,
	undefined
>;

export function imageDimensionsMeta<
	TInput extends string,
	const TMessage extends v.ErrorMessage<v.RegexIssue<TInput>> | undefined,
>(message: TMessage): v.RegexAction<TInput, TMessage>;

export function imageDimensionsMeta(
	message?: v.ErrorMessage<v.RegexIssue<string>>,
): v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined> {
	return v.regex(IMAGE_DIMENSIONS_META_REGEX, message);
}
