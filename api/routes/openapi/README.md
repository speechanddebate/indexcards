# Indexcards Openapi

Indexcards uses an [OpenAPI 3.1](https://swagger.io/specification/) document to define its endpoints. This document is used to:
- communicate the structure of the API to our community
- serve a scalar instance at `/v1/reference` to aid in development of the api.
- generate code on the schmats frontend for interacting with the api. (see schemats docs for more info).

The 10,000ft view is that we take the `.openapi = {...}` from each route, and, together with the other information defined in [`/api/routes/openapi`](/api/routes/openapi/), build a single document served at `/v1`.

Below are some standards to follow when defining your route.

## OpenAPI Version

Use [OpenAPI 3.1](https://swagger.io/specification/) conventions in endpoint definitions and shared schemas.

# Defining the Endpoint
There are a couple of things the should be defined on each endpoint:
- **`path:`** The full path after the version identifier with path parameters replaced. If the endpoint can be called at `/v1/foo/:barId` the path should be `path: 'foo/{barId}`
	> [!NOTE]
	> This is not actually put in the openapi document but it is how the generator function builds the document
- **`OperationId:`** The programmatic name of the operation, used to generate code on the frontend. see [a dialogue on operation naming](#a-dialogue-on-operation-naming) for more information
- **`summary:`** A human readable name for the operation. Likely a non-camelCase version of the operationId.
- **`description:`** This can be a longer form explanation of the endpoint.
- **`tags:`** Tags are how endpoints are organized in scalar
- **`parameters:`** THe parameters the endpoint accepts.
	>[!NOTE]
	> The path parameters for each route are automatically added and do not need to be specified.
- **`responses`** The various response types for an endpoint

A good example of what a openapi definition can look like are:
```js

router.route('/:personId').get(controller.getParadigmByPersonId).openapi = {
	path: '/rest/paradigms/{personId}',
	summary: 'Get paradigm details by person ID',
	operationId: 'getParadigm',
	tags: ['Paradigms'],
	responses: {
		200: {
			description: 'Paradigm details for the specified person ID',
			content: {
				'application/json': {
					schema: {'$ref': '#/components/schemas/ParadigmDetails'},
				},
			},
		},
		404: { $ref: '#/components/responses/NotFound' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};
```
If more detail is needed on what a valid spec looks like, consult the openapi 3.1 specification.

## Where Definitions Live

- Endpoint operation snippets live with their corresponding routers. The definition for a route should live directly on the route in question.
```js
router.route('/:personId').get(controller.getParadigmByPersonId).openapi = {
	//openapi definition
};
```
- Shared schemas and response objects live in this `openapi` area.
- Build the generated OpenAPI document with:

```bash
npm run build:openapi
```
> [!NOTE]
> this also runs on `npm run build` && `npm run dev`

## Orval-Focused Rules

These are the most important rules for frontend generation and mocks:

1. **Keep `operationId` stable.**
- Orval uses this as the generated method name.
- Changing it is a frontend breaking change.

2. **Declare `required` explicitly at the object level.**
- Non-required fields are treated as optional and can become `undefined` in mocks.

3. **Model nullability intentionally.**
- If a field can be null, declare it (`nullable: true` or OpenAPI 3.1 equivalent such as `type: ['string', 'null']`).
- Do not rely on consumers guessing from examples.

4. **Use `readOnly`/`writeOnly` when schemas are reused.**
- Example: `id` should be `readOnly` in create/update request contexts.

5. **Provide realistic examples.**
- Include examples for response bodies, nested arrays, and enums/labels.

6. **Set `additionalProperties` intentionally.**

- Use `additionalProperties: false` when object shape is strict.
- Leave it open only when extra keys are truly expected.

## A Dialogue on Operation Naming
There is a duel mandate when giving an endpoint an operationId. An operationId should contain enough information to make it distinct from other operations, but, because these operationIds get turned into function calls in schemats, they should also be as brief as possible. Generally the operationId should describe the resource being returned and only get into the *how* if there are conflicting methods.

