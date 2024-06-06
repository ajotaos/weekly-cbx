import {
	makeTableItemPartitionKey,
	makeTableItemSortKey,
} from '#/utils/dynamodb';

import type { IssueUniqueSlugTableItem } from '@/types';

export const issueUniqueSlugTableItemKeys = {
	makePk(props: Pick<IssueUniqueSlugTableItem, 'slug'>) {
		return makeTableItemPartitionKey('issues', 'unq', 'slug', props.slug);
	},
	makeSk() {
		return makeTableItemSortKey('#');
	},
};
