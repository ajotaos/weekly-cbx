type NonEmptyArray<T> = [T, ...Array<T>];

export function makeBucketObjectKey(...parts: NonEmptyArray<string>) {
	return parts.join('/');
}
