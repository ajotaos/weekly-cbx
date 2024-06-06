import { makeBucketObjectKey } from '#/utils/s3';

export type MakeIssuePageBucketObjectKeyProps = {
	issueId: string;
	id: string;
};

export function makeIssuePageBucketObjectKey(
	props: MakeIssuePageBucketObjectKeyProps,
) {
	return makeBucketObjectKey('issues', props.issueId, `page-${props.id}.jpg`);
}
