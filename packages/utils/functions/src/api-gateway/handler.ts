import middy from '@middy/core';

import httpContentEncoding from '@middy/http-content-encoding';
import httpContentNegotiation from '@middy/http-content-negotiation';
import httpCors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpResponseSerializer from '@middy/http-response-serializer';
import httpSecurityHeaders from '@middy/http-security-headers';
import httpUrlencodePathParametersParser from '@middy/http-urlencode-path-parser';

import { createError } from '@middy/util';

import * as v from 'valibot';

import type { BaseApiGatewayEvent, BaseApiGatewayResult } from './types';

import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';

export function makeApiGateway<
	TEventSchema extends v.GenericSchema<BaseApiGatewayEvent>,
	// TResult extends BaseApiGatewayResult,
>(
	eventSchema: TEventSchema,
	// handler: (
	// 	event: v.InferOutput<TEventSchema>,
	// 	context: Context,
	// ) => Promise<TResult>,
) {
	type Handler<TResult extends BaseApiGatewayResult> = (
		event: v.InferOutput<TEventSchema>,
		context: Context,
	) => Promise<TResult>;

	return {
		handler<TResult extends BaseApiGatewayResult>(handler: Handler<TResult>) {
			return middy()
				.use(httpEventNormalizer())
				.use(httpHeaderNormalizer())
				.use(
					httpContentNegotiation({
						availableMediaTypes: ['application/json'],
					}),
				)
				.use(httpUrlencodePathParametersParser())
				.use(httpJsonBodyParser())
				.use(httpSecurityHeaders())
				.use(httpCors())
				.use(httpContentEncoding())
				.use(
					httpResponseSerializer({
						serializers: [
							{
								regex: /^application\/json$/,
								serializer: ({ body }) => JSON.stringify(body),
							},
						],
						defaultContentType: 'application/json',
					}),
				)
				.use(httpEventValidator(eventSchema))
				.use(
					httpErrorHandler({
						fallbackMessage: JSON.stringify({
							message: "Something went wrong. We're working on a fix.",
						}),
					}),
				)
				.handler(handler);
		},
	};
}

function httpJsonBodyParser<
	TEventType extends APIGatewayProxyEventV2 = APIGatewayProxyEventV2,
>(): middy.MiddlewareObj<TEventType> {
	return {
		before(request) {
			const contentType =
				request.event.headers?.['Content-Type'] ??
				request.event.headers?.['content-type'];

			const body = request.event.body;

			if (contentType !== undefined && body === undefined) {
				throw createError(
					415,
					JSON.stringify({
						message:
							"Request includes 'Content-Type' header, but no data is provided. Omit the header or include a valid body.",
					}),
					{
						cause: { package: '@middy/http-json-body-parser' },
					},
				);
			}

			const mimePattern = /^application\/(.+\+)?json($|;.+)/;

			if (
				body !== undefined &&
				(contentType === undefined || !mimePattern.test(contentType))
			) {
				throw createError(
					415,
					JSON.stringify({
						message:
							"Missing or invalid 'Content-Type' header. Only 'application/json' is supported.",
					}),
					{
						cause: { package: '@middy/http-json-body-parser' },
					},
				);
			}

			if (contentType === 'application/json' && body !== undefined) {
				try {
					const data = request.event.isBase64Encoded
						? Buffer.from(body, 'base64').toString()
						: body;

					request.event.body = JSON.parse(data);
				} catch (err) {
					// UnprocessableEntity
					throw createError(
						415,
						JSON.stringify({
							message:
								'Invalid JSON format. Please check the data structure and syntax.',
						}),
						{
							cause: { package: '@middy/http-json-body-parser', data: err },
						},
					);
				}
			}
		},
	};
}

function httpEventValidator<
	TSchema extends v.GenericSchema<BaseApiGatewayEvent>,
>(schema: TSchema): middy.MiddlewareObj<v.InferOutput<TSchema>> {
	return {
		before(request) {
			const parsedEventResult = v.safeParse(schema, request.event, {
				abortEarly: true,
				abortPipeEarly: true,
			});

			if (!parsedEventResult.success) {
				throw createError(
					400,
					JSON.stringify({
						message:
							'Invalid request. Please check the provided information for errors.',
						issues: v.flatten(parsedEventResult.issues),
					}),
					{
						cause: {
							package: 'valibot',
							data: parsedEventResult.issues,
						},
					},
				);
			}

			request.event = parsedEventResult.output;
		},
	};
}
