import * as v from 'valibot';

import { deepCamelKeys } from 'string-ts';

import type { OverrideProperties, Simplify } from 'type-fest';

type TableItemPrimaryKey = {
	Pk: string;
	Sk: string;
};

type TableItemGsiKey<
	T extends number,
	TValue extends string | number | symbol,
> = Simplify<
	{ [key in `Gsi${T}Pk`]: string } & {
		[key in `Gsi${T}Sk`]: TValue;
	}
>;
type TableItemGsi1Key = TableItemGsiKey<1, string>;
type TableItemGsi2Key = TableItemGsiKey<2, string>;
type TableItemGsi3Key = TableItemGsiKey<3, string>;

type TableItemKeys = TableItemPrimaryKey &
	TableItemGsi1Key &
	TableItemGsi2Key &
	TableItemGsi3Key;

type RemoveTableItemKey<
	TEntries extends Partial<Record<keyof TableItemKeys, unknown>> & {
		[TEntryKey in keyof TEntries]: TEntryKey extends keyof TableItemKeys
			? TEntries[TEntryKey]
			: never;
	},
> = OverrideProperties<
	{
		[TTableItemKey in keyof TableItemKeys]?: never;
	},
	TEntries
>;

type BaseTableItem = (
	| RemoveTableItemKey<TableItemPrimaryKey>
	| RemoveTableItemKey<TableItemPrimaryKey & TableItemGsi1Key>
	| RemoveTableItemKey<
			TableItemPrimaryKey & TableItemGsi1Key & TableItemGsi2Key
	  >
	| RemoveTableItemKey<
			TableItemPrimaryKey &
				TableItemGsi1Key &
				TableItemGsi2Key &
				TableItemGsi3Key
	  >
) & { Expiration?: number | undefined };

export function tableItem<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	TItemSchema extends v.GenericSchema<BaseTableItem, any>,
>(schema: TItemSchema) {
	return v.pipe(
		schema,
		v.transform((value) => omit(value, keysToOmit)),
		v.transform(deepCamelKeys),
	);
}

const keysToOmit = new Set([
	'Pk',
	'Sk',
	'Gsi1Pk',
	'Gsi1Sk',
	'Gsi2Pk',
	'Gsi2Sk',
	'Gsi3Pk',
	'Gsi3Sk',
	'Gsi4Pk',
	'Gsi4Sk',
	'Expiration',
] as const);

function omit<T extends object, K extends keyof T>(
	object: T,
	keysToOmit: ReadonlySet<K>,
) {
	return Object.fromEntries(
		Object.entries(object).filter(([key]) => !keysToOmit.has(key as K)),
	) as Omit<T, K>;
}
