import {
	makeTableItemPartitionKey,
	makeTableItemSortKey,
} from '#/utils/dynamodb';

import type { SeriesUniqueSlugTableItem } from '@/types';

export const seriesUniqueSlugTableItemKeys = {
	makePk(props: Pick<SeriesUniqueSlugTableItem, 'slug'>) {
		return makeTableItemPartitionKey('series', 'unq', 'slug', props.slug);
	},
	makeSk() {
		return makeTableItemSortKey('#');
	},
};
