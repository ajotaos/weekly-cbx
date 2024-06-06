import {
	makeTableItemPartitionKey,
	makeTableItemSortKey,
} from '#/utils/dynamodb';

import type { PublisherUniqueSlugTableItem } from '@/types';

export const publisherUniqueSlugTableItemKeys = {
	makePk(props: Pick<PublisherUniqueSlugTableItem, 'slug'>) {
		return makeTableItemPartitionKey('publishers', 'unq', 'slug', props.slug);
	},
	makeSk() {
		return makeTableItemSortKey('#');
	},
};
