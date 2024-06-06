import { IMAGE_DIMENSIONS_META_PARTS_REGEX } from '@/regex';

import * as v from 'valibot';

export type ImageDimensionsMetaParts = {
	width: string;
	height: string;
};

export function toImageDimensionsMetaParts(): v.TransformAction<
	string,
	ImageDimensionsMetaParts
> {
	return v.transform(
		(value) =>
			IMAGE_DIMENSIONS_META_PARTS_REGEX.exec(value)
				?.groups as ImageDimensionsMetaParts,
	);
}
