import * as v from 'valibot';

export function imageWidth<TInput extends number>(): v.CheckAction<
	TInput,
	undefined
>;

export function imageWidth<
	TInput extends number,
	const TMessage extends v.ErrorMessage<v.CheckIssue<TInput>> | undefined,
>(message: TMessage): v.CheckAction<TInput, TMessage>;

export function imageWidth(
	message?: v.ErrorMessage<v.CheckIssue<number>>,
): v.CheckAction<number, v.ErrorMessage<v.CheckIssue<number>> | undefined> {
	return v.check((value) => Number.isInteger(value) && value > 0, message);
}
