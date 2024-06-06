import {
	makeTableItemPartitionKey,
	makeTableItemSortKey,
} from '#/utils/dynamodb';

import type { IssueTableItem } from '@/types';

export const issueTableItemKeys = {
	makePk(props: Pick<IssueTableItem, 'id'>) {
		return makeTableItemPartitionKey('issues', 'id', props.id);
	},
	makeSk() {
		return makeTableItemSortKey('#');
	},
	makeGsi1Pk(props: Pick<IssueTableItem, 'slug'>) {
		return makeTableItemPartitionKey('issues', 'slug', props.slug);
	},
	makeGsi1Sk() {
		return makeTableItemSortKey('#');
	},
	makeGsi2Pk(props: Pick<IssueTableItem, 'seriesId'>) {
		return makeTableItemPartitionKey('issues', 'series-id', props.seriesId);
	},
	makeGsi2Sk(props: Pick<IssueTableItem, 'slug'>) {
		return makeTableItemSortKey('slug', props.slug);
	},
	makeGsi3Pk(props: Pick<IssueTableItem, 'releaseDate'>) {
		return makeTableItemPartitionKey(
			'issues',
			'release-date',
			props.releaseDate,
		);
	},
	makeGsi3Sk(props: Pick<IssueTableItem, 'slug'>) {
		return makeTableItemSortKey('slug', props.slug);
	},
};
