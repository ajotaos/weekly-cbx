import * as v from 'valibot';

export function imageHeight<TInput extends number>(): v.CheckAction<
	TInput,
	undefined
>;

export function imageHeight<
	TInput extends number,
	const TMessage extends v.ErrorMessage<v.CheckIssue<TInput>> | undefined,
>(message: TMessage): v.CheckAction<TInput, TMessage>;

export function imageHeight(
	message?: v.ErrorMessage<v.CheckIssue<number>>,
): v.CheckAction<number, v.ErrorMessage<v.CheckIssue<number>> | undefined> {
	return v.check((value) => Number.isInteger(value) && value > 0, message);
}
