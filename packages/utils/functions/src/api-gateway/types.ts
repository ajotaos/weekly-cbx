import * as v from 'valibot';

import type { APIGatewayProxyResultV2 } from 'aws-lambda';

import type { Jsonifiable, Simplify } from 'type-fest';

export function apiGatewayEvent<
	TBodySchema extends v.GenericSchema<Jsonifiable>,
	TPathParamsSchema extends v.GenericSchema<Record<string, string>>,
	TQueryStringParamsSchema extends v.GenericSchema<Record<string, string>>,
>(
	bodySchema: TBodySchema,
	pathParamsSchema: TPathParamsSchema,
	queryStringParamsSchema: TQueryStringParamsSchema,
) {
	return v.object({
		...apiGatewayProxyEventV2Schema.entries,
		body: bodySchema,
		pathParameters: pathParamsSchema,
		queryStringParameters: queryStringParamsSchema,
	});
}

export const apiGatewayCert = v.object({
	clientCertPem: v.string(),
	subjectDN: v.string(),
	issuerDN: v.string(),
	serialNumber: v.string(),
	validity: v.object({
		notBefore: v.string(),
		notAfter: v.string(),
	}),
});

export const requestContextV2Authorizer = v.object({
	jwt: v.optional(
		v.object({
			claims: v.record(v.string(), v.any()),
			scopes: v.optional(v.array(v.string())),
		}),
	),
	iam: v.optional(
		v.object({
			accessKey: v.optional(v.string()),
			accountId: v.optional(v.string()),
			callerId: v.optional(v.string()),
			principalOrgId: v.nullish(v.string()),
			userArn: v.optional(v.string()),
			userId: v.optional(v.string()),
			cognitoIdentity: v.nullish(
				v.object({
					amr: v.array(v.string()),
					identityId: v.string(),
					identityPoolId: v.string(),
				}),
			),
		}),
	),
	lambda: v.optional(v.record(v.string(), v.any())),
});

export const requestContextV2Http = v.object({
	method: v.picklist([
		'GET',
		'POST',
		'PUT',
		'PATCH',
		'DELETE',
		'HEAD',
		'OPTIONS',
	]),
	path: v.string(),
	protocol: v.string(),
	sourceIp: v.pipe(v.string(), v.ip()),
	userAgent: v.string(),
});

export const requestContextV2 = v.object({
	accountId: v.string(),
	apiId: v.string(),
	authorizer: v.optional(requestContextV2Authorizer),
	authentication: v.nullish(
		v.object({
			clientCert: v.optional(apiGatewayCert),
		}),
	),
	domainName: v.string(),
	domainPrefix: v.string(),
	http: requestContextV2Http,
	requestId: v.string(),
	routeKey: v.string(),
	stage: v.string(),
	time: v.string(),
	timeEpoch: v.number(),
});

export const apiGatewayProxyEventV2Schema = v.object({
	version: v.string(),
	routeKey: v.string(),
	rawPath: v.string(),
	rawQueryString: v.string(),
	cookies: v.optional(v.array(v.string())),
	headers: v.record(v.string(), v.string()),
	queryStringParameters: v.record(v.string(), v.string()),
	pathParameters: v.record(v.string(), v.string()),
	stageVariables: v.nullish(v.record(v.string(), v.string())),
	requestContext: requestContextV2,
	body: v.unknown(),
	isBase64Encoded: v.boolean(),
});

export type BaseApiGatewayEvent = v.InferOutput<
	typeof apiGatewayProxyEventV2Schema
>;

export type BaseApiGatewayResult<TBody extends Jsonifiable = Jsonifiable> =
	Simplify<Omit<APIGatewayProxyResultV2, 'body'> & { body: TBody }>;
