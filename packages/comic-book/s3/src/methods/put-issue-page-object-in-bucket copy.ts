import { makeIssuePageBucketObjectKey } from '@/keys';

import { fileTypeFromStream } from 'file-type';
import { imageDimensionsFromStream } from 'image-dimensions';

import ExifTransformer from 'exif-be-gone';
import { ReReadable } from 'rereadable-stream';

import { Upload } from '@aws-sdk/lib-storage';

import { Readable } from 'node:stream';

import { hexid } from '#/utils/hexid';

import * as v from 'valibot';
import * as vx from '#/valibot';

import type { IssuePageRawBucketObject } from '@/types';

import type { StripAmzMetaPrefixKeys } from '#/utils/s3';

import type { S3Client } from '@aws-sdk/client-s3';

export type PutIssuePageObjectInBucketProps = {
	issueId: string;
	body: Readable;
};

export async function putIssuePageObjectInBucket(
	props: PutIssuePageObjectInBucketProps,
	bucketName: string,
	client: S3Client,
) {
	const { issueId, body } = parseIssuePageProps(props);

	const { mime, dimensions } = await createIssuePageBodyProps(body).then(
		parseIssuePageBodyProps,
	);

	const id = hexid();
	const key = makeIssuePageBucketObjectKey({ issueId, id });

	const metadata = {
		'issue-id': issueId,
		id,
		mime,
		dimensions: `${dimensions.width}x${dimensions.height}`,
	} satisfies StripAmzMetaPrefixKeys<IssuePageRawBucketObject['Metadata']>;

	const upload = new Upload({
		client,
		params: {
			Bucket: bucketName,
			Key: key,
			Body: body.rewind(),
			Metadata: metadata,
			ContentType: mime,
		},
	});

	await upload.done();

	return { object: { issueId, id } };
}

function parseIssuePageProps(input: unknown) {
	return v.parse(issuePagePropsSchema, input, {
		abortEarly: true,
		abortPipeEarly: true,
	});
}

const issuePagePropsSchema = v.object({
	issueId: v.pipe(v.string(), v.ulid()),
	body: v.pipe(
		v.instance(Readable),
		v.transform((value) =>
			value.pipe(new ExifTransformer()).pipe(new ReReadable()),
		),
	),
});

function parseIssuePageBodyProps(input: unknown) {
	return v.parse(issuePageBodyPropsSchema, input, {
		abortEarly: true,
		abortPipeEarly: true,
	});
}

const issuePageBodyPropsSchema = v.object({
	mime: v.literal('image/jpeg'),
	dimensions: v.union([
		v.object({
			width: v.pipe(v.number(), vx.imageWidth(), v.picklist([1_988, 3_975])),
			height: v.pipe(v.number(), vx.imageHeight(), v.picklist([3_056])),
		}),
		v.object({
			width: v.pipe(v.number(), vx.imageWidth(), v.picklist([1_988, 3_976])),
			height: v.pipe(v.number(), vx.imageHeight(), v.picklist([3_057])),
		}),
	]),
});

async function createIssuePageBodyProps(body: ReReadable) {
	const [mime, dimensions] = await Promise.all([
		fileTypeFromStream(body.rewind()).then(
			(file) => file?.mime ?? 'application/octet-stream',
		),
		imageDimensionsFromStream(body.rewind()).then((dimensions) => ({
			width: dimensions?.width ?? 0,
			height: dimensions?.height ?? 0,
		})),
	]);
	return { mime, dimensions };
}
