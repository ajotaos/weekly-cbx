import {
	makeTableItemPartitionKey,
	makeTableItemSortKey,
} from '#/utils/dynamodb';

import type { SeriesTableItem } from '@/types';

export const seriesTableItemKeys = {
	makePk(props: Pick<SeriesTableItem, 'id'>) {
		return makeTableItemPartitionKey('series', 'id', props.id);
	},
	makeSk() {
		return makeTableItemSortKey('#');
	},
	makeGsi1Pk(props: Pick<SeriesTableItem, 'slug'>) {
		return makeTableItemPartitionKey('series', 'slug', props.slug);
	},
	makeGsi1Sk() {
		return makeTableItemSortKey('#');
	},
	makeGsi2Pk(props: Pick<SeriesTableItem, 'publisherId'>) {
		return makeTableItemPartitionKey(
			'series',
			'publisher-id',
			props.publisherId,
		);
	},
	makeGsi2Sk(props: Pick<SeriesTableItem, 'slug'>) {
		return makeTableItemSortKey('slug', props.slug);
	},
	makeGsi3Pk(props: Pick<SeriesTableItem, 'releaseDate'>) {
		return makeTableItemPartitionKey(
			'series',
			'release-date',
			props.releaseDate,
		);
	},
	makeGsi3Sk(props: Pick<SeriesTableItem, 'slug'>) {
		return makeTableItemSortKey('slug', props.slug);
	},
};
