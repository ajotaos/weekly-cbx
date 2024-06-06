import {
	bucketObject,
	bucketObjectKey,
	bucketObjectMetadata,
} from '#/utils/s3';

import { Readable } from 'node:stream';

import * as v from 'valibot';
import * as vx from '#/valibot';

export const issuePageBucketObjectSchema = bucketObject(
	v.object({
		Key: bucketObjectKey(
			v.strictTuple([
				v.literal('issues'),
				v.pipe(v.string(), v.ulid()),
				v.string(),
			]),
		),
		Body: v.instance(Readable),
		Metadata: bucketObjectMetadata(
			v.object({
				'x-amz-meta-issue-id': v.pipe(v.string(), v.ulid()),
				'x-amz-meta-id': v.pipe(v.string(), v.hexadecimal(), v.length(8)),
				'x-amz-meta-mime': v.literal('image/jpeg'),
				'x-amz-meta-dimensions': v.pipe(
					v.string(),
					vx.imageDimensionsMeta(),
					vx.toImageDimensionsMetaParts(),
					v.object({
						width: v.pipe(
							v.string(),
							v.transform((value) => Number(value)),
							vx.imageWidth(),
						),
						height: v.pipe(
							v.string(),
							v.transform((value) => Number(value)),
							vx.imageHeight(),
						),
					}),
				),
			}),
		),
	}),
);

export type IssuePageRawBucketObject = v.InferInput<
	typeof issuePageBucketObjectSchema
>;
export type IssuePageBucketObject = v.InferOutput<
	typeof issuePageBucketObjectSchema
>;
