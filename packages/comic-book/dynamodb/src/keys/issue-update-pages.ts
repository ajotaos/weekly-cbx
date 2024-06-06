import {
	makeTableItemPartitionKey,
	makeTableItemSortKey,
} from '#/utils/dynamodb';

import type { IssueUpdatePagesTableItem } from '@/types';

export const issueUpdatePagesTableItemKeys = {
	makePk(props: Pick<IssueUpdatePagesTableItem['issue'], 'id'>) {
		return makeTableItemPartitionKey('issues', 'upd', 'pages', 'id', props.id);
	},
	makeSk(props: Pick<IssueUpdatePagesTableItem, 'nonce'>) {
		return makeTableItemSortKey('nonce', props.nonce);
	},
};
