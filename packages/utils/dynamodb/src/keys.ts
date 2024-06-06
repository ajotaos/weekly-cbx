type NonEmptyArray<T> = [T, ...Array<T>];

export function makeTableItemPartitionKey(...parts: NonEmptyArray<string>) {
	return parts.map((part) => `${part}:`).join('');
}

export function makeTableItemSortKey(...parts: NonEmptyArray<string>) {
	return takeWhile(parts, (part) => part.length > 0)
		.map((part) => `${part}:`)
		.join('');
}

function takeWhile<T>(values: Array<T>, predicate: (value: T) => boolean) {
	const array: Array<T> = [];

	for (const value of values) {
		if (!predicate(value)) {
			break;
		}

		array.push(value);
	}

	return array;
}
