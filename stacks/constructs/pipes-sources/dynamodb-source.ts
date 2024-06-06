import { Topic } from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';

import type { IPipe, ISource, SourceConfig } from '@aws-cdk/aws-pipes-alpha';

import type { Duration } from 'aws-cdk-lib';
import type { ITable } from 'aws-cdk-lib/aws-dynamodb';
import type { IRole } from 'aws-cdk-lib/aws-iam';
import type { ITopic } from 'aws-cdk-lib/aws-sns';
import type { IQueue } from 'aws-cdk-lib/aws-sqs';

/**
 * Base parameters for streaming sources.
 */
export interface StreamSourceParameters {
	/**
	 * The maximum number of records to include in each batch.
	 *
	 * Minumum: 1
	 * Maxiumum: 10000
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html#cfn-pipes-pipe-pipesourcekinesisstreamparameters-batchsize
	 * @default 1
	 */
	readonly batchSize?: number;

	/**
	 * Define the target queue to send dead-letter queue events to.
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html#cfn-pipes-pipe-pipesourcekinesisstreamparameters-deadletterconfig
	 * @default - no dead-letter queue or topic
	 */
	readonly deadLetterTarget?: IQueue | ITopic;

	/**
	 * The maximum length of a time to wait for events.
	 *
	 * Minumum: Duration.seconds(0)
	 * Maxiumum: Duration.seconds(300)
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html#cfn-pipes-pipe-pipesourcekinesisstreamparameters-maximumbatchingwindowinseconds
	 * @default - the events will be handled immediately
	 */
	readonly maximumBatchingWindow?: Duration;

	/**
	 * (Streams only) Discard records older than the specified age. The default value is -1, which sets the maximum age to infinite. When the value is set to infinite, EventBridge never discards old records.
	 *
	 * Minumum: Duration.seconds(60) (leave undefined to set the maximum age to -1)
	 * Maxiumum: Duration.seconds(604800)
	 *
	 *  @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html#cfn-pipes-pipe-pipesourcekinesisstreamparameters-maximumrecordageinseconds
	 * @default -1 - EventBridge won't discard old records
	 */
	readonly maximumRecordAge?: Duration;

	/**
	 * (Streams only) Discard records after the specified number of retries. The default value is -1, which sets the maximum number of retries to infinite. When MaximumRetryAttempts is infinite, EventBridge retries failed records until the record expires in the event source.
	 *
	 * Minumum: -1
	 * Maxiumum: 10000
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html#cfn-pipes-pipe-pipesourcekinesisstreamparameters-maximumretryattempts
	 * @default -1 - EventBridge will retry failed records until the record expires in the event source
	 */
	readonly maximumRetryAttempts?: number;

	/**
	 * (Streams only) Define how to handle item process failures. {@link OnPartialBatchItemFailure.AUTOMATIC_BISECT} halves each batch and will retry each half until all the records are processed or there is one failed message left in the batch.
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html#cfn-pipes-pipe-pipesourcekinesisstreamparameters-onpartialbatchitemfailure
	 * @default off - EventBridge will retry the entire batch
	 */
	readonly onPartialBatchItemFailure?: OnPartialBatchItemFailure;

	/**
	 * (Streams only) The number of batches to process concurrently from each shard.
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcekinesisstreamparameters.html#cfn-pipes-pipe-pipesourcekinesisstreamparameters-parallelizationfactor
	 * @default 1
	 */
	readonly parallelizationFactor?: number;
}

/**
 * The position in a DynamoDB stream from which to start reading.
 */
export enum DynamoDBStartingPosition {
	/**
	 * Start reading at the last (untrimmed) stream record,
	 * which is the oldest record in the shard.
	 */
	TRIM_HORIZON = 'TRIM_HORIZON',
	/**
	 * Start reading just after the most recent stream record in the shard,
	 * so that you always read the most recent data in the shard.
	 */
	LATEST = 'LATEST',
}

/**
 * Define how to handle item process failures.
 */
export enum OnPartialBatchItemFailure {
	/**
	 * EventBridge halves each batch and will retry each half until all the
	 * records are processed or there is one failed message left in the batch.
	 */
	AUTOMATIC_BISECT = 'AUTOMATIC_BISECT',
}

/**
 * Sources that support a dead-letter target.
 */
export abstract class SourceWithDeadLetterTarget implements ISource {
	/**
	 * Determines if the source is an instance of SourceWithDeadLetterTarget.
	 */
	public static isSourceWithDeadLetterTarget(
		source: ISource,
	): source is SourceWithDeadLetterTarget {
		return (
			(source as SourceWithDeadLetterTarget).deadLetterTarget !== undefined
		);
	}
	/**
	 * The ARN of the source resource.
	 */
	readonly sourceArn: string;
	/**
	 * The dead-letter SQS queue or SNS topic.
	 */
	readonly deadLetterTarget?: IQueue | ITopic;

	constructor(sourceArn: string, deadLetterTarget?: IQueue | ITopic) {
		this.sourceArn = sourceArn;
		this.deadLetterTarget = deadLetterTarget;
	}

	abstract bind(pipe: IPipe): SourceConfig;
	abstract grantRead(grantee: IRole): void;

	/**
	 * Grants the pipe role permission to publish to the dead-letter target.
	 */
	public grantPush(grantee: IRole, deadLetterTarget?: IQueue | ITopic) {
		if (deadLetterTarget instanceof Queue) {
			deadLetterTarget.grantSendMessages(grantee);
		} else if (deadLetterTarget instanceof Topic) {
			deadLetterTarget.grantPublish(grantee);
		}
	}

	/**
	 * Retrieves the ARN from the dead-letter SQS queue or SNS topic.
	 */
	protected getDeadLetterTargetArn(
		deadLetterTarget?: IQueue | ITopic,
	): string | undefined {
		if (deadLetterTarget instanceof Queue) {
			return deadLetterTarget.queueArn;
		}

		if (deadLetterTarget instanceof Topic) {
			return deadLetterTarget.topicArn;
		}
		return undefined;
	}
}

/**
 * Streaming sources.
 */
export abstract class StreamSource extends SourceWithDeadLetterTarget {
	/**
	 * The ARN of the source resource.
	 */
	readonly sourceArn: string;
	/**
	 * Base parameters for streaming sources.
	 */
	readonly sourceParameters: StreamSourceParameters;

	constructor(sourceArn: string, sourceParameters: StreamSourceParameters) {
		super(sourceArn, sourceParameters.deadLetterTarget);
		this.sourceArn = sourceArn;
		this.sourceParameters = sourceParameters;

		validateBatchSize(this.sourceParameters.batchSize);
		validateMaximumBatchingWindow(
			this.sourceParameters.maximumBatchingWindow?.toSeconds(),
		);
		validateMaximumRecordAge(
			this.sourceParameters.maximumRecordAge?.toSeconds(),
		);
		validateMaxiumRetryAttemps(this.sourceParameters.maximumRetryAttempts);
		validateParallelizationFactor(this.sourceParameters.parallelizationFactor);
	}
}

function validateBatchSize(batchSize?: number) {
	if (batchSize !== undefined) {
		if (batchSize < 1 || batchSize > 10000) {
			throw new Error(
				`Batch size must be between 1 and 10000, received ${batchSize}`,
			);
		}
	}
}

function validateMaximumBatchingWindow(window?: number) {
	if (window !== undefined) {
		// only need to check upper bound since Duration amounts cannot be negative
		if (window > 300) {
			throw new Error(
				`Maximum batching window must be between 0 and 300, received ${window}`,
			);
		}
	}
}

function validateMaximumRecordAge(age?: number) {
	if (age !== undefined) {
		if (age < 60 || age > 604800) {
			throw new Error(
				`Maximum record age in seconds must be between 60 and 604800 (leave undefined for infinite), received ${age}`,
			);
		}
	}
}

function validateMaxiumRetryAttemps(attempts?: number) {
	if (attempts !== undefined) {
		if (attempts < -1 || attempts > 10000) {
			throw new Error(
				`Maximum retry attempts must be between -1 and 10000, received ${attempts}`,
			);
		}
	}
}

function validateParallelizationFactor(factor?: number) {
	if (factor !== undefined) {
		if (factor < 1 || factor > 10) {
			throw new Error(
				`Parallelization factor must be between 1 and 10, received ${factor}`,
			);
		}
	}
}

/**
 * Parameters for the DynamoDB source.
 */
export interface DynamoDBSourceParameters extends StreamSourceParameters {
	/**
	 * (Streams only) The position in a stream from which to start reading.
	 *
	 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-pipes-pipe-pipesourcedynamodbstreamparameters.html#cfn-pipes-pipe-pipesourcedynamodbstreamparameters-startingposition
	 */
	readonly startingPosition: DynamoDBStartingPosition;
}

/**
 * A source that reads from an DynamoDB stream.
 */
export class DynamoDBSource extends StreamSource {
	private readonly table: ITable;
	private readonly startingPosition: DynamoDBStartingPosition;
	private readonly deadLetterTargetArn?: string;

	constructor(table: ITable, parameters: DynamoDBSourceParameters) {
		if (table.tableStreamArn === undefined) {
			throw new Error(
				'Table does not have a stream defined, cannot create pipes source',
			);
		}

		super(table.tableStreamArn, parameters);
		this.table = table;
		this.startingPosition = parameters.startingPosition;
		this.deadLetterTargetArn = this.getDeadLetterTargetArn(
			this.deadLetterTarget,
		);
	}

	bind(_pipe: IPipe): SourceConfig {
		return {
			sourceParameters: {
				dynamoDbStreamParameters: {
					batchSize: this.sourceParameters.batchSize,
					deadLetterConfig: this.deadLetterTargetArn
						? { arn: this.deadLetterTargetArn }
						: undefined,
					maximumBatchingWindowInSeconds:
						this.sourceParameters.maximumBatchingWindow?.toSeconds(),
					maximumRecordAgeInSeconds:
						this.sourceParameters.maximumRecordAge?.toSeconds(),
					maximumRetryAttempts: this.sourceParameters.maximumRetryAttempts,
					onPartialBatchItemFailure:
						this.sourceParameters.onPartialBatchItemFailure,
					parallelizationFactor: this.sourceParameters.parallelizationFactor,
					startingPosition: this.startingPosition,
				},
			},
		};
	}

	grantRead(grantee: IRole): void {
		this.table.grantStreamRead(grantee);
	}
}
