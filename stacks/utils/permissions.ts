import type * as cdk from 'aws-cdk-lib';

export function permission<TResouce extends cdk.IResource>(
	resource: TResouce,
	grant: keyof TResouce & `grant${string}` & string,
) {
	return [resource, grant] as [TResouce, string];
}
