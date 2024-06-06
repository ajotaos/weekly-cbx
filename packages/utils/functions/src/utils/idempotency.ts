import { IdempotencyConfig } from '@aws-lambda-powertools/idempotency';
import { DynamoDBPersistenceLayer } from '@aws-lambda-powertools/idempotency/dynamodb';

export type IdempotencyOptions = {
	eventKeyJmesPath?: string;
	expiresAfterSeconds?: number;
};

export class Idempotency {
	constructor(
		private readonly props: { tableName: string; options?: IdempotencyOptions },
	) {}

	get tableName() {
		return this.props.tableName;
	}

	get options() {
		return this.props.options;
	}
}

export function makeIdempotencyPersistenceStore(tableName: string) {
	return new DynamoDBPersistenceLayer({
		tableName,
		keyAttr: 'Pk',
		expiryAttr: 'Expiration',
		inProgressExpiryAttr: 'InProgressExpiration',
		statusAttr: 'Status',
		dataAttr: 'Data',
		validationKeyAttr: 'Validation',
	});
}

export function makeIdempotencyConfig(options?: IdempotencyOptions) {
	return new IdempotencyConfig({
		eventKeyJmesPath: options?.eventKeyJmesPath as string,
		expiresAfterSeconds: options?.expiresAfterSeconds as number,
		throwOnNoIdempotencyKey: true,
	});
}
